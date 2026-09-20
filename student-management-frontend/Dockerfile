# Build the Angular production bundle, then serve it with Nginx.
FROM node:22-alpine AS build
WORKDIR /workspace

COPY package.json package-lock.json ./
# package-lock.json was generated with npm 11; npm 10 in the base Node 22
# image can fail while reading it.
RUN npm install --global npm@11.17.0
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/dist/student-management-frontend/browser /usr/share/nginx/html

EXPOSE 80
