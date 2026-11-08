# Deploy TRA APP to Vercel

1. Extract the project ZIP.
2. Push the project folder contents to a GitHub repository.
3. In Vercel, choose **Add New → Project** and import that repository.
4. Select **Vite** as the framework preset.
5. Set **Build Command** to `npm run build` and **Output Directory** to `dist`.
6. Click **Deploy**.

No environment variables are required for the current frontend.

For local development, run `npm install` and then `npm run dev`.
