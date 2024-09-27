/**
 * We are using License Authentication
 * https://keygen.sh/docs/api/authentication/#license-authentication
 * 1. Check that the license is valid (what this file does). If so, grab the license ID in the response object
 * 2. Use the license id to authenticate the license key
 * 3. Use that to checkout a license file for the current machine
 * 4. Store the license file in the app data directory
 * @param {string} KEYGEN_ACCOUNT_ID
 * @param {string} key
 */

export default async function validateLicenseKey(KEYGEN_ACCOUNT_ID, key) {
  const url = `https://api.keygen.sh/v1/accounts/${KEYGEN_ACCOUNT_ID}/licenses/actions/validate-key`;

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
    },
    body: JSON.stringify({
      meta: {
        key,
      },
    }),
  };

  const response = await fetch(url, options);
  const json = await response.json();
  console.log(json);
  return json;
}
