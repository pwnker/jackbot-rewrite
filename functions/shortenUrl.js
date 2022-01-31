const got = require("got");

module.exports = async function shortenUrl(url, slug) {
  const options = {
    method: "POST",
    url: "https://api.short.io/links",
    headers: {
      authorization: process.env.SHORTIO_KEY,
    },
    json: {
      originalURL: url,
      domain: `0xja.cc`,
      path: slug,
    },
    responseType: "json",
  };

  const response = await got(options);

  if (response.statusCode == 200) {
    return response.body.secureShortURL ?? url;
  } else {
    throw new Error(
      `Something broke, here is what we know\nhttp status: ${response.status}\nhttp status: ${response.statusText}\nData:\n${response.data}`
    );
  }
};
