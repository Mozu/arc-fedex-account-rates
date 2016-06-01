# arc-fedex-account-rates
### version 0.1.1

Using arc, the developer is able to pull in account rates from Fedex, and update the shipping model accordingly.

Arc.js action to make your entire store, or selected pages on your store, accessible only to logged-in users.

### Installation
Create a new application in your Mozu developer account. Note its application key.

Clone this repository:

```sh
git clone https://github.com/Mozu/arc-fedex-account-rates.git
```

Change into the new repo directory:

```sh
cd arc-fedex-account-rates
```

Run the Yeoman generator for creating Mozu configuration to connect to your developer account:

```sh
yo mozu-app --config
```

*(If you don't have the `yo` utility, or this generator, installed, you can install both at once with `npm install -g yo generator-mozu-app`.)*

Fill out the prompts, including the developer application key you noted above.

Install dependencies:

```sh
npm install
npm install soap
npm install extend
```
