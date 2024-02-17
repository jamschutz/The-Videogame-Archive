from .Config import Config
from .Secrets import Secrets

from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient, ContentSettings

class AzureStorageManager:
    def __init__(self):
        self.config = Config()
        self.secrets = Secrets()

        # Create the BlobServiceClient object
        self.blob_service_client = BlobServiceClient(self.secrets.AZ_STORAGE_URL, credential=self.secrets.AZ_STORAGE_KEY)


    def save_to_archive(self, data, folderpath, filename, content_type):
        # build filepath in azure
        az_blob_container = f'{self.config.AZ_ARCHIVE_FOLDER}/{folderpath}'

        # create blob connection
        blob_client = self.blob_service_client.get_blob_client(container=az_blob_container, blob=filename)

        # upload
        content_settings = ContentSettings(content_type=content_type)
        blob_client.upload_blob(data, overwrite=True, content_settings=content_settings)


if __name__ == '__main__':
    manager = AzureStorageManager()

    folderpath = 'test/2024'
    filename = 'test.html'
    data = """
<!DOCTYPE html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,height=device-height,initial-scale=1.0" />

<html lang="en">
  <head>
    <title>azure blob upload test</title>
  </head>

  <body>
    <div>
        Hello! This is an azure blob upload test file.
    </div>
  </body>
</html>
    """

    print('saving to archive...')
    manager.save_to_archive(data, folderpath, filename, 'text/html')
    print('done!')