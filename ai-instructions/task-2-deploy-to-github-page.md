# Guidelines

## Rules
1. Deploy to github pages like a pro developer
2. Ensure the code and structure follows latest standard and maintainable


## Instruction List 1

### Instructions
1. Check the `../../frontend-vue3-boilerplate/` project
2. There I have already handled deploying github pages
3. It is a vue/vite frontend project, which required many steps. For this project, deploying should be simple
4. You can implement similarly or follow latest standards
5. Add the instructs for deployment in `../docs/` directory of this project.

### Comments
1. It created necessary files
2. The deployment guide needs some modification like update naming and remove unnecessary info


## Instruction List 2

### Instructions
1. Do I need a page deploy script similar to frontend-vue3-boilerplate?
2. And are there any security concern like exposing any secrets?
3. Update the deploy.yml file name to be more accurate. Something like deploy-to-github-pages.yml. Ensure updating wherever it is mentioned
4. I want the deployment when the code is pushed only to `release/prod` branch

### Comments
1. It followed instructions
2. I've added the claude settings file and gitignore
3. I got error in Github's Action Tab


## Instruction List 3

### Instructions
1. I got error while deployment. The error is
```sh
Annotations
2 errors
deploy
Branch "release/prod" is not allowed to deploy to github-pages due to environment protection rules.
deploy
The deployment was rejected or didn't satisfy other protection rules.
```
2. How to fix this error?
3. If any improvement is needed in codebase related to this, do it

### Comments
1. It did some change in deployment script. Let's try it
2. The changes seems working