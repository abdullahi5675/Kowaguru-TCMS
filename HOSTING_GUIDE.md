# How to Host the App on Your Own Website

**To answer your boss's question:** Yes! You absolutely can host this application on your own website, and it is highly recommended to do so for a professional appearance. 

You do **not** need to move the code away from Vercel to do this. Vercel allows you to easily connect your own website's domain name (like `kowaguru.com` or `app.kowaguru.com`) directly to your deployed application.

Here is a simple, step-by-step guide on how to set this up.

---

## 1. Decide on the Domain or Subdomain
First, decide what link you want your customers to type in.
- **Main Domain:** If you want the app to be your entire website, you would use `kowaguru.com` or `kowaguru.com.ng`.
- **Subdomain (Recommended):** If you already have a main website and just want the app to be a portal, you should use a subdomain like `app.kowaguru.com` or `tcms.kowaguru.com`.

## 2. Add the Domain in Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click on your project (`kowaguru-tcms`).
3. Click on the **Settings** tab at the top.
4. On the left sidebar, click on **Domains**.
5. Type in the domain or subdomain you chose (e.g., `app.kowaguru.com`) and click **Add**.

## 3. Configure Your DNS (Domain Settings)
After clicking "Add", Vercel will give you a record that you need to add to your Domain Registrar (the place where you bought your domain, like Namecheap, GoDaddy, QServers, or Whogohost).

Vercel will ask you to add one of the following:
- An **A Record** (if you are using a main domain like `kowaguru.com`).
- A **CNAME Record** (if you are using a subdomain like `app.kowaguru.com`).

**How to do it:**
1. Log in to your Domain Registrar (where you bought the website name).
2. Find the **DNS Settings** or **Zone Editor**.
3. Create a new record and copy-paste the values Vercel gave you.
   - *Example for CNAME:* Type: `CNAME`, Name: `app`, Value: `cname.vercel-dns.com`
4. Save the changes.

## 4. Wait for it to Connect
DNS changes can take anywhere from a few minutes to a few hours to update across the internet. 
Go back to your Vercel Domains page. Once the connection is successful, Vercel will automatically generate a free, secure **SSL Certificate** for you, and the red errors will turn into green checkmarks.

---

### Summary for your Boss:
*"We can keep the high-speed hosting exactly where it is now, but we can completely mask the `vercel.app` link with our own official company website link (like `app.kowaguru.com`). It takes about 10 minutes to configure in our domain settings and costs nothing extra."*
