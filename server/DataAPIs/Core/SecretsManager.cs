using Infisical.Sdk;


namespace VideoGameArchive.Core
{
    public static class SecretsManager
    {
        public static Dictionary<string, string> secrets = new Dictionary<string, string>();
        private static readonly string[] SECRETS_FOLDERS = { "/", "/postgres" };


        public static string Get(string secret)
        {
            return secrets[secret];
        }


        public static void Init(string clientId, string clientSecret, string projectId, string environment)
        {
            // init infisical client
            ClientSettings settings = new ClientSettings
            {
                Auth = new AuthenticationOptions
                {
                    UniversalAuth = new UniversalAuthMethod
                    {
                        ClientId = clientId,
                        ClientSecret = clientSecret
                    }
                }
            };
            var infisicalClient = new InfisicalClient(settings);

            // get all secrets in all folders, and cache
            secrets = new Dictionary<string, string>();
            foreach(var folder in SECRETS_FOLDERS) {
                var options = new ListSecretsOptions
                {
                    ProjectId = projectId,
                    Environment = environment,
                    AttachToProcessEnv = false,
                    Path = folder
                };

                var infisicalSecrets = infisicalClient.ListSecrets(options);
                foreach(var secret in infisicalSecrets) {
                    SecretsManager.secrets[secret.SecretKey] = secret.SecretValue;
                }
            }
        }
    }
}