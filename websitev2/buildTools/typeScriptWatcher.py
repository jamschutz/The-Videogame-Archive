import os
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import subprocess, sys


current_dir = os.getcwd()
compile_js_script_path = f'{current_dir}\\buildTools\\compile_js.ps1'


class Handler(FileSystemEventHandler):
    @staticmethod
    def on_any_event(event):
        if event.is_directory:
            return None
 
        elif event.event_type == 'created':
            # Event is created, you can process it now
            print("new typescript file found, rebuilding")
            p = subprocess.Popen(f'powershell.exe -ExecutionPolicy RemoteSigned -file "{compile_js_script_path}"', stdout=sys.stdout)
            p.communicate()

        elif event.event_type == 'modified':
            # Event is modified, you can process it now
            print("typescript file updated, rebuilding")
            p = subprocess.Popen(f'powershell.exe -ExecutionPolicy RemoteSigned -file "{compile_js_script_path}"', stdout=sys.stdout)
            p.communicate()


# taken from: https://pythonhosted.org/watchdog/quickstart.html#a-simple-example
if __name__ == "__main__":
    # build watch folder
    watch_folder = f'{current_dir}\\src\\code'

    # build observer
    event_handler = Handler()
    observer = Observer()
    observer.schedule(event_handler, watch_folder, recursive=True)

    # run observer
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()

    observer.join()