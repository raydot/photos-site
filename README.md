# PHOTOS-SITE APP

A photo-viewing and downloading Next application built to road-test the Windsurf IDE.

## Description

Upload a bunch of pictures to Cloudinary and this app will put them into a website where they can be viewed and downloaded.  The application is built to be deployed via Vercel.

## Customizations

There was originally admin upload functionality, but it was easier to just upload to Cloudinary
There is a "Christmas themed word list" that is used to convert the file names into something more readable (and festive).  These can easily be changed to suit any occasion
There is "delete" button functionality for images which is not used 
Cloudinary handles the creation of image Thumbnails which can be further customized
The application was built with Typescript but is is minimally used
Type checking is skipped because it was throwing warnings that were just confusing the AI

## Other Stuff

Originally the site used a lot more API stoff than was needed.  There are some leftover references to MongoDB and Prisma, both of which were dropped in the final build.

## NEXT BOILERPLATE

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
