const { machineId } = require("node-machine-id");

/**
 * Step 3: Checkout a machine file for the current machine
 * Save this data somewhere
 * https://keygen.sh/docs/api/machines/#machines-actions-check-out
 * @param {string} KEYGEN_ACCOUNT_ID
 * @param {string} license_key
 */
export default async function checkoutMachineFile(
  KEYGEN_ACCOUNT_ID,
  license_key
) {
  const fingerprint = await machineId();

  const url = `https://api.keygen.sh/v1/accounts/${KEYGEN_ACCOUNT_ID}/machines/${fingerprint}/actions/check-out?encrypt=1`;

  console.log("Attempting checkout url:", url);
  console.log("Attempting checkout license key:", license_key);

  const options = {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      Authorization: `License ${license_key}`,
    },
  };

  const response = await fetch(url, options);
  const { data, errors } = await response.json();

  if (errors) {
    console.error(errors);
    return false;
  }

  console.log(data);

  return data.attributes.certificate;
}
