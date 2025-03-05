# ใช้ Node.js เวอร์ชัน 14 (หรือเวอร์ชันที่คุณต้องการ)
FROM node:20

# กำหนด Working Directory ภายใน container
WORKDIR /usr/src/app

# คัดลอกไฟล์ package.json และ package-lock.json (ถ้ามี)
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# คัดลอกโค้ดทั้งหมดไปใน container
COPY . .

# เปิดพอร์ตที่ backend ใช้งาน (ในที่นี้คือ 8080)
EXPOSE 5002

# สั่งให้รันแอปพลิเคชัน (แก้ไขคำสั่งนี้ให้ตรงกับสคริปต์ของคุณ)
CMD ["node", "server.js"]
