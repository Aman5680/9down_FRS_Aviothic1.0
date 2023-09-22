FROM node:latest

WORKDIR /app

RUN apt update -y && apt upgrade -y
RUN apt install git -y

RUN git clone https://github.com/SanjaySRocks/9down_FRS_Aviothic1.0.git .

RUN npm install

EXPOSE 3000

CMD ["npm","start"]
