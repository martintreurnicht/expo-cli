import fs from 'fs';

import prompt from '../../prompt';
import log from '../../log';

import BaseUploader from './BaseUploader';
import { printError, spawnAndCollectJSONOutputAsync } from './utils';

export default class AndroidUploader extends BaseUploader {
  constructor(projectDir, options) {
    super(projectDir, options, 'android', 'Android', 'apk');
  }

  ensurePlatformOptionsAreCorrect() {
    const { key } = this.options;
    if (key && !fs.existsSync(key)) {
      throw new Error(`No such file: ${key}`);
    }
  }

  ensureConfigDataIsCorrect(configData) {
    const { android } = configData;
    if (!android || !android.package) {
      throw new Error(`Must specify a package in order to upload apk file.`);
    }
  }

  getPlatformData() {
    if (!this.options.key) {
      log('You can specify json file ID using --key option');
      return prompt({
        name: 'key',
        message: 'The service account json file used to authenticate with Google Play Store:  ',
        type: 'input',
      });
    }
    return { key: this.options.key };
  }

  async uploadToStore({ android: { package: androidPackage } }, { key }, path) {
    const fastlane = this.getFastlane();
    const supply = await spawnAndCollectJSONOutputAsync(fastlane.app_supply, [
      androidPackage,
      path,
      key,
    ]);
    if (supply.result !== 'success') {
      printError(supply, 'supply');
    }
  }
}
