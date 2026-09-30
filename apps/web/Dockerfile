FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
COPY packages/rules/package.json packages/rules/package.json
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci
COPY apps/web apps/web
RUN npm run build -w @victory/web
EXPOSE 3001
CMD ["npm", "run", "start", "-w", "@victory/web"]
