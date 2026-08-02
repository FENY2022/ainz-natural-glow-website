# AINZ Natural Glow Soap Website

A responsive static e-commerce landing page for AINZ Natural Glow Soap.

## Included

- Rice Turmeric, Rice Rosemary, and Himalayan Salt product cards
- Price: ₱159 per bar
- Responsive shopping cart with quantity controls
- Cart saved in the browser using localStorage
- SMS checkout to 0995 923 7839
- Mobile-friendly navigation and accessible UI
- Render Blueprint configuration (`render.yaml`)

## Deploy to Render

1. Upload this folder to a GitHub repository.
2. In Render, choose **New > Static Site**.
3. Connect the GitHub repository.
4. Use:
   - Build Command: `echo "Static website ready"`
   - Publish Directory: `.`
5. Click **Create Static Site**.

Render will provide an `onrender.com` address after deployment.

## Customize

- Edit product details in `app.js`.
- Edit page text in `index.html`.
- Edit colors and layout in `styles.css`.
- Replace images inside the `assets` folder while keeping the same filenames.

## Order behavior

Because this is a static site, checkout prepares an SMS message for the customer to send. Delivery fees, availability, and payment are confirmed directly through the contact number.
