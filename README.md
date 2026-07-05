# 🛍️ Shopfront

> A modern full-stack MERN E-commerce platform built with MongoDB, Express, React, and Node.js.

## 🌐 View Live 

🛍️ **Shopfront:** [🔗 Visit Live](https://shopfront-navy.vercel.app)

⚙️ **Backend API:** [🔗 Visit API](https://shopfront-backend-bfl4.onrender.com)

## ✨ Features
- JWT Authentication & Role-Based Authorization
- Product Catalog, Categories, Search & Sorting
- Wishlist & Shopping Cart
- Flash Sales with Countdown Timer
- Product Reviews & Ratings
- Order Tracking
- Admin Dashboard
- Analytics
- Email Notifications
- Dark / Light Mode

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, React Router, Context API, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |
| Security | express-validator, express-rate-limit |
| Email | Nodemailer |


## 📂 Project Structure

```text
📦 shopfront
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── uploads
│   ├── utils
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   ├── context
│   │   ├── pages
│   │   ├── services
│   │   ├── utils
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## 🚀 Installation

```bash
git clone https://github.com/karanmaurya-git/shopfront.git
cd shopfront

cd backend
npm install

cd ../frontend
npm install
```

## 🔑 Environment Variables

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=Shopfront <your-email@gmail.com>
```

## ▶️ Run

Backend

```bash
cd backend
npm run dev
```

Frontend

```bash
cd frontend
npm run dev
```

## 🗺️ Future Enhacements

- Payment Gateway
- Cloudinary Integration
- Coupons
- PDF Invoice
- Docker
- CI/CD

## 🤝 Contributing

Contributions are always welcome!

## 📜 License

Licensed under the MIT License.

## 👨‍💻 Author

**Karan Maurya**

GitHub: [@karanmaurya-git](https://github.com/karanmaurya-git)

LinkedIn: [karan-maurya-4260b6293](https://www.linkedin.com/in/karan-maurya-4260b6293/)

---

