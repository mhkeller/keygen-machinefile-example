const { platform, hostname } = require("os");
const { machineId } = require("node-machine-id");

/**
 * Step 2: Authenticate the license key so we can use it in API cals
 * https://keygen.sh/docs/api/authentication/#license-authentication
 * https://keygen.sh/docs/api/machines/#machines-create
 * @param {string} KEYGEN_ACCOUNT_ID
 * @param {Object} data
 * @param {string} data.license_key
 * @param {string} data.license_id
 */
export default async function checkoutLicenseFile(
  KEYGEN_ACCOUNT_ID,
  { license_key, license_id }
) {
  const fingerprint = await machineId();

  const url = `https://api.keygen.sh/v1/accounts/${KEYGEN_ACCOUNT_ID}/machines`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
      Authorization: `License ${license_key}`,
    },
    body: JSON.stringify({
      data: {
        type: "machines",
        attributes: {
          fingerprint,
          platform: platform(),
          name: hostname(),
        },
        relationships: {
          license: {
            data: {
              type: "licenses",
              id: license_id,
            },
          },
        },
      },
    }),
  };

  const response = await fetch(url, options);
  const json = response.json();
  if (json.errors) {
    console.error(json);
    return false;
  }
  console.log(json);

  return true;
}
