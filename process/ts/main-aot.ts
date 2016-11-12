import { platformBrowser }    from '@angular/platform-browser';

import { AppModuleNgFactory } from './app.module.ngfactory';


const platform = platformBrowser();
platform.bootstrapModuleFactory(AppModuleNgFactory);
