const API_URL =
  import.meta.env.VITE_API_URL;

const DEV_API_URL = '/api';

function getBaseUrl() {
  if (import.meta.env.DEV) {
    return DEV_API_URL;
  }

  if (!API_URL) {
    throw new Error(
      'VITE_API_URL belum diatur.'
    );
  }

  return API_URL;
}

async function parseResponse(response) {
  if (!response.ok) {
    throw new Error(
      `HTTP_${response.status}`
    );
  }

  let json;

  try {
    json = await response.json();
  } catch (_) {
    throw new Error(
      'API_INVALID_JSON'
    );
  }

  if (!json.ok) {
    throw new Error(
      json.error || 'API_ERROR'
    );
  }

  return json.data;
}

export async function getApi(
  action,
  params = {}
) {
  const query =
    new URLSearchParams({
      action,
      ...params,
    });

  const url =
    `${getBaseUrl()}?${query.toString()}`;

  console.log(
    '[PMR GET]',
    url
  );

  try {
    const response =
      await fetch(
        url,
        {
          method: 'GET',

          headers: {
            Accept:
              'application/json',
          },

          cache:
            'no-store',
        }
      );

    return await parseResponse(
      response
    );

  } catch (err) {

    console.error(
      '[PMR GET ERROR]',
      err
    );

    throw err;
  }
}

export async function postApi(
  payload
) {
  const url =
    getBaseUrl();

  console.log(
    '[PMR POST]',
    url,
    payload
  );

  try {

    const response =
      await fetch(
        url,
        {
          method: 'POST',

          /*
           * Google Apps Script Web App:
           * gunakan simple request agar browser
           * tidak melakukan CORS preflight OPTIONS.
           *
           * Body tetap JSON.
           */
          headers: {
            'Content-Type':
              'text/plain;charset=UTF-8',

            Accept:
              'application/json',
          },

          body:
            JSON.stringify(
              payload
            ),

          cache:
            'no-store',
        }
      );

    console.log(
      '[PMR POST RESPONSE]',
      response.status,
      response.url
    );

    return await parseResponse(
      response
    );

  } catch (err) {

    console.error(
      '[PMR POST ERROR]',
      {
        message:
          err?.message,

        name:
          err?.name,

        payload,
      }
    );

    throw err;
  }
}

export {
  API_URL,
};