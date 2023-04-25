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

/**
 * Removes files that where generated in previous JHipster versions and therefore
 * need to be removed.
 */
export default function cleanupOldFilesTask({ application } = {}) {
  if (this.isJhipsterVersionLessThan('7.0.0-beta.0')) {
    this.removeFile(`${application.clientSrcDir}app/admin/audits/audits.component.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/audits/audits.service.ts`);
    this.removeFile(`${application.clientSrcDir}app/admin/audits/audits.vue`);
    this.removeFile(`${application.clientTestDir}spec/app/admin/audits/audits.component.spec.ts`);
  }
  if (this.isJhipsterVersionLessThan('7.0.2')) {
    this.removeFile('config/index.js');
    this.removeFile('config/dev.env.js');
    this.removeFile('config/prod.env.js');
  }
  if (this.isJhipsterVersionLessThan('7.0.1')) {
    this.removeFile('.npmrc');
  }

  if (this.isJhipsterVersionLessThan('7.3.1')) {
    this.removeFile('webpack/env.js');
    this.removeFile('webpack/dev.env.js');
    this.removeFile('webpack/prod.env.js');
    this.removeFile('webpack/utils.js');
    this.removeFile('webpack/loader.conf.js');
  }

  if (this.isJhipsterVersionLessThan('7.4.2')) {
    this.removeFile(`${application.clientSrcDir}app/entities/user/user.oauth2.service.ts`);
  }
  if (this.isJhipsterVersionLessThan('7.10.1')) {
    this.removeFile('tsconfig.spec.json');
    this.removeFile(`${application.clientSrcDir}app/shared/config/formatter.ts`);
    this.removeFile(`${application.clientTestDir}spec/app/shared/config/formatter.spec.ts`);
  }
}
