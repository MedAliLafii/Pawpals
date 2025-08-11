# 🚀 PawPals Deployment Guide

This guide will help you deploy your PawPals application to Vercel for free.

## 📋 Prerequisites

1. **GitHub Account**: Your code should be in a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Database**: You'll need a cloud database (see options below)

## 🗄️ Database Options for Production

### Option 1: PlanetScale (Recommended - Free Tier)
- Sign up at [planetscale.com](https://planetscale.com)
- Create a new database
- Get your connection string
- Update your `.env` file with the new database credentials

### Option 2: Railway
- Sign up at [railway.app](https://railway.app)
- Create a new MySQL database
- Get your connection string

### Option 3: Supabase
- Sign up at [supabase.com](https://supabase.com)
- Create a new PostgreSQL database
- Update your backend to use PostgreSQL

## 🔧 Backend Deployment

Since Vercel is primarily for frontend deployment, you'll need to deploy your backend separately:

### Option 1: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Select the `back` folder
4. Add environment variables:
   ```
   DB_HOST=your-database-host
   DB_PORT=3306
   DB_USER=your-database-user
   DB_PASSWORD=your-database-password
   DB_NAME=your-database-name
   JWT_SECRET=your-secret-key
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   JWT_MAIL=your-email@gmail.com
   MAIL=your-email@gmail.com
   PASS=your-app-password
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```

### Option 2: Render
1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set the root directory to `back`
5. Add environment variables as above

## 🌐 Frontend Deployment (Vercel)

### Step 1: Update API URLs
Before deploying, update all API URLs in your Angular application to point to your deployed backend:

```typescript
// In your services, change from:
'http://localhost:5000'

// To:
'https://your-backend-url.railway.app'
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (root of your project)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/site`
   - **Install Command**: `npm install`

### Step 3: Environment Variables
Add these environment variables in Vercel:
```
NODE_ENV=production
```

### Step 4: Deploy
Click "Deploy" and wait for the build to complete.

## 🔄 Database Migration

After setting up your cloud database, run the database seeding script:

```bash
# Update the database connection in back/seed-database.js
# Then run:
cd back
node seed-database.js
```

## 🌍 Custom Domain (Optional)

1. In your Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update your DNS settings as instructed

## 🔒 Security Considerations

1. **Environment Variables**: Never commit sensitive data to your repository
2. **CORS**: Ensure your backend CORS settings allow your Vercel domain
3. **HTTPS**: Vercel provides SSL certificates automatically
4. **Rate Limiting**: Consider adding rate limiting to your backend

## 📊 Monitoring

- **Vercel Analytics**: Built-in analytics for your frontend
- **Railway/Render Logs**: Monitor your backend performance
- **Database Monitoring**: Use your database provider's monitoring tools

## 🚨 Troubleshooting

### Common Issues:

1. **CORS Errors**: Update your backend CORS settings to include your Vercel domain
2. **Database Connection**: Ensure your database is accessible from your backend provider
3. **Build Failures**: Check the build logs in Vercel for specific errors
4. **Environment Variables**: Verify all environment variables are set correctly

### Debug Steps:
1. Check Vercel build logs
2. Check backend deployment logs
3. Test API endpoints directly
4. Verify database connectivity

## 📈 Performance Optimization

1. **Image Optimization**: Use WebP format for images
2. **Lazy Loading**: Implement lazy loading for components
3. **Caching**: Set up proper caching headers
4. **CDN**: Vercel provides global CDN automatically

## 🎉 Success!

Once deployed, your PawPals application will be available at:
- Frontend: `https://your-project.vercel.app`
- Backend: `https://your-backend-url.railway.app`

## 📞 Support

If you encounter issues:
1. Check the deployment logs
2. Verify all environment variables
3. Test locally with production database
4. Check the troubleshooting section above

---

**Happy Deploying! 🐾**
