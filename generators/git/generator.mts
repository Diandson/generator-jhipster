/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable consistent-return */
import chalk from 'chalk';

import BaseGenerator from '../base/index.mjs';
import { GENERATOR_GIT, GENERATOR_PROJECT_NAME } from '../generator-list.mjs';
import { files } from './files.mjs';
import command from './command.mjs';

/**
 * @class
 * @extends {BaseGenerator}
 */
export default class InitGenerator extends BaseGenerator {
  gitInstalled;
  gitInitialized;
  skipGit;

  async beforeQueue() {
    await this.dependsOnJHipster(GENERATOR_PROJECT_NAME);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_GIT);
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      parseOptions() {
        this.parseJHipsterOptions(command.options);
      },
      async checkGit() {
        if (!this.skipGit) {
          this.gitInstalled = (await this.createGit().version()).installed;
          if (!this.gitInstalled) {
            this.logger.warn('Git repository will not be created, as Git is not installed on your system');
            this.skipGit = true;
          }
        }
      },
      async initializeMonorepository() {
        if (!this.skipGit && this.options.monorepository) {
          await this.initializeGitRepository();
        }
      },
    });
  }

  get [BaseGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writeFiles() {
        await this.writeFiles({ sections: files, context: {} });
      },
    });
  }

  get [BaseGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get install() {
    return this.asInstallTaskGroup({
      async initGitRepo() {
        if (!this.skipGit && !this.options.monorepository) {
          await this.initializeGitRepository();
        }
      },
    });
  }

  get [BaseGenerator.INSTALL]() {
    return this.delegateTasksToBlueprint(() => this.install);
  }

  get end() {
    return this.asEndTaskGroup({
      /** Initial commit to git repository after package manager install for package-lock.json */
      async gitCommit() {
        if (this.skipGit) return;
        if (!this.gitInitialized) {
          this.logger.warn('The generated application could not be committed to Git, as a Git repository could not be initialized.');
          return;
        }
        this.debug('Committing files to git');
        const git = this.createGit();
        const repositoryRoot = await git.revparse(['--show-toplevel']);
        const result = await git.log(['-n', '1', '--', '.']).catch(() => {});
        if (result && result.total > 0) {
          this.logger.info(
            `Found commits in Git from ${repositoryRoot}. So we assume this is application regeneration. Therefore automatic Git commit is not done. You can do Git commit manually.`
          );
          return;
        }
        try {
          const statusResult = await git.status();
          if (statusResult.staged.length > 0) {
            this.logger.info(`The repository ${repositoryRoot} has staged files, skipping commit.`);
            return;
          }
          await git.add(['.']);
          let commitMsg = `Initial version of ${this.jhipsterConfig.baseName} generated by generator-jhipster@${this.jhipsterConfig.jhipsterVersion}`;
          if (this.jhipsterConfig.blueprints && this.jhipsterConfig.blueprints.length > 0) {
            const bpInfo = this.jhipsterConfig.blueprints.map(bp => `${bp.name}@${bp.version}`).join(', ');
            commitMsg += ` with blueprints ${bpInfo}`;
          }
          await git.commit(commitMsg);
          this.logger.log(chalk.green.bold(`Application successfully committed to Git from ${repositoryRoot}.`));
        } catch (e) {
          this.logger.error(chalk.red.bold(`Application commit to Git failed from ${repositoryRoot}. Try to commit manually.`));
        }
      },
    });
  }

  get [BaseGenerator.END]() {
    return this.delegateTasksToBlueprint(() => this.end);
  }

  async initializeGitRepository() {
    try {
      const git = this.createGit();
      this.gitInitialized = (await git.checkIsRepo()) || ((await git.init()) && true);
      this.logger.log(chalk.green.bold('Git repository initialized.'));
    } catch (error) {
      this.logger.warn(`Failed to initialize Git repository.\n ${error}`);
    }
  }
}
