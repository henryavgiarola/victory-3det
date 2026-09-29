FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
COPY packages/rules/package.json packages/rules/package.json
COPY apps/api/package.json apps/api/package.json
RUN npm ci
COPY packages/rules packages/rules
COPY apps/api apps/api
RUN npm run build -w @victory/rules && npm run build -w @victory/api
EXPOSE 3000
CMD ["node", "apps/api/dist/main.js"]
