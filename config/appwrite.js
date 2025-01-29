const nodeappwrite = require("node-appwrite");
const { Client, Account } = nodeappwrite;

async function createSessionClient() {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_HOST_NAME)
    .setProject(process.env.APPWRITE_PROJECT_ID)

  return {
    get account() {
      return new Account(client);
    },
  };
}

async function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_HOST_NAME)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  return {
    get account() {
      return new Account(client);
    },
    get database() {
      return new Databases(client);
    },
    get user() {
      return new Users(client);
    },
  };
}

module.exports = {
  createSessionClient,
  createAdminClient,
};
