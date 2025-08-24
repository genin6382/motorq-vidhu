# README.md

## How to clone?
```
git clone [text](https://github.com/genin6382/motorq-vidhu)

cp .env.example .env

npm install

npx prisma migrate dev --name init

npm run dev
```

## Documenting the process
1. Created node app + typescript
2. Created docker container for postgresql
3. Installed prisma for database-ORM
4. Created schema.prisma -> defines database structure 
5. Added indexes to optimize analytics  
4. Using zod for validation 
5. Increased modularity by splitting code into :
    * database/ - connecting to Postgresql , Establishing Prisma Client 
    * routes/ - app level routes 
    * services/ - business logic 
    * repositories/ - prisma orm
    * schemas/ - input validation 
6. Usting **.rest** for testing apis 