# TICF Zendesk integration with TxMA

This repository allows for Zendesk integration with Transaction Monitoring and Auditing (TxMA) which is part of the Digital Identity (DI) system. Events from Zendesk will be able to trigger an automated process to begin the extraction of Audit data from S3.

Threat Intelligence and Counter Fraud (TICF) analysts will be able to request

## Pre-requisites

To run this project you will need the following:

- [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) - Used to build and deploy the application
- [Node.js](https://nodejs.org/en/) - Recommended way to install is via [NVM](https://github.com/nvm-sh/nvm)
- [Docker](https://docs.docker.com/get-docker/) - Required to run SAM locally
- [Yarn](https://yarnpkg.com/getting-started/install) - The package manager for the project

## Getting started

The project is using [Yarn Zero Installs](https://yarnpkg.com/features/zero-installs). So as long as Yarn itself is installed, everything should be ready to go out of the box. The only thing that needs to be enabled is the Husky hooks.

```
yarn husky install
```

Zero installs works because the dependencies are committed via the `.yarn` folder. These are all compressed, so the folder size is much smaller than `node_modules` would be.

In order to ensure that dependencies cannot be altered by anything other than Yarn itself, we run `yarn install --check-cache` in the pipeline. This avoids the possibility of malicous users altering any dependency code.

## Licence

[MIT License](LICENCE)
