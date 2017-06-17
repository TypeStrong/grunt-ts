import * as utils from './utils';
import * as chokidar from 'chokidar';

class Watcher {
    private lastCompileTimestampInMs = new Date().getTime();
    public watchDelayInMs = 100;
    public readonly acceptedExtentions = ['.ts', '.tsx', '.js', '.jsx', '.html'];
    public readonly watcher: chokidar.FSWatcher;
    private isHandlingWatchEvent: boolean = false;

    constructor(
        public readonly watchPath: string[],
        public readonly projectRootPath: string,
        private readonly logWriteLn: (textToWrite: string) => void,
        private readonly errorWriteLn: (errorToWrite: string) => void,
        private readonly addFileToCompilationContext: (fileName: string) => void,
        private readonly removeFileFromCompilationContext: (fileName: string) => void,
        private readonly compile: () => void ) {

            this.logWriteLn(('Watching all TypeScript / Html files under : ' + this.watchPath.join(', ')).cyan);
            this.watcher = chokidar.watch(watchPath, { ignoreInitial: true, persistent: true });
            this.configureWatcher();
    }

    private configureWatcher() {
        this.watcher.on('add', path => this.handleAdd(path))
            .on('change', path => this.handleChange(path))
            .on('unlink', path => this.handleRemove(path))
            .on('error', error => this.errorWriteLn('Error happened in chokidar: ' + error));
    }

    handleAdd(filePath: string) {
        if (!utils.endsWithAny(filePath.toLowerCase(), this.acceptedExtentions) || this.isTooSoonToCompileAgain() || this.isHandlingWatchEvent) {
            return;
        }
        this.isHandlingWatchEvent = true;
        this.logWriteLn(('+++ added    >>' + filePath).yellow);
        this.addFileToCompilationContext(filePath);
        this.compile();
        this.lastCompileTimestampInMs = new Date().getTime();
        this.isHandlingWatchEvent = false;
    }

    handleChange(filePath: string) {
        if (!utils.endsWithAny(filePath.toLowerCase(), this.acceptedExtentions) || this.isTooSoonToCompileAgain() || this.isHandlingWatchEvent) {
            return;
        }
        this.isHandlingWatchEvent = true;
        this.logWriteLn(('### changed  >>' + filePath).yellow);
        this.compile();
        this.lastCompileTimestampInMs = new Date().getTime();
        this.isHandlingWatchEvent = false;
    }

    handleRemove(filePath: string) {
        if (!utils.endsWithAny(filePath.toLowerCase(), this.acceptedExtentions) || this.isTooSoonToCompileAgain() || this.isHandlingWatchEvent) {
            return;
        }
        this.isHandlingWatchEvent = true;
        this.logWriteLn(('--- removed  >>' + filePath).yellow);
        this.removeFileFromCompilationContext(filePath);
        this.compile();
        this.lastCompileTimestampInMs = new Date().getTime();
        this.isHandlingWatchEvent = false;
    }

    isTooSoonToCompileAgain() {
        return (new Date().getTime() - this.lastCompileTimestampInMs) <= this.watchDelayInMs;
    }
}

export default Watcher;
