/* global axios */

const serverMessages = new Map();
const knownPolicyIds = new Map();
const knownTimeStampPolicyIds = new Map();
const knownExtKeyUsages = new Map();
const knownKeyUsages = new Map();
const knownSignatureAlgorithms = new Map();
const knownKeyStorages = new Map();
const knownAuthoritiesOptions = [];
const knownSubscriptions = new Map();
const knownSubscriptionFeatures = new Map();
const knownCertificationAuthorities = [];

// eslint-disable-next-line no-unused-vars
const knownStringsInitialization = (async function init() {
  let response;
  try {
    response = await axios.get('https://sigex.kz/api/strings');
  } catch {
    return;
  }

  if (response.data.message) {
    return;
  }

  Object.keys(response.data.errorMessages).forEach((message) => {
    const { ru, description } = response.data.errorMessages[message];
    serverMessages.set(message, `${ru[0].toUpperCase()}${ru.slice(1)}: ${description}.`);
  });

  Object.keys(response.data.consts.policyOIDs).forEach((oid) => {
    const { ru } = response.data.consts.policyOIDs[oid];
    knownPolicyIds.set(oid, ru);
  });

  Object.keys(response.data.consts.timeStampPolicyOIDs).forEach((oid) => {
    const { ru } = response.data.consts.timeStampPolicyOIDs[oid];
    knownTimeStampPolicyIds.set(oid, ru);
  });

  Object.keys(response.data.consts.extKeyUsageOIDs).forEach((oid) => {
    const { ru } = response.data.consts.extKeyUsageOIDs[oid];
    knownExtKeyUsages.set(oid, ru);
  });

  Object.keys(response.data.consts.keyUsages).forEach((oid) => {
    const { ru } = response.data.consts.keyUsages[oid];
    knownKeyUsages.set(oid, ru);
  });

  Object.keys(response.data.consts.signatureAlgorithmOIDs).forEach((oid) => {
    const { ru } = response.data.consts.signatureAlgorithmOIDs[oid];
    knownSignatureAlgorithms.set(oid, ru);
  });

  Object.keys(response.data.consts.keyStorageOIDs).forEach((oid) => {
    const { ru } = response.data.consts.keyStorageOIDs[oid];
    knownKeyStorages.set(oid, ru);
  });

  Object.keys(response.data.consts.ncaAuthorityOIDs).forEach((oid) => {
    const { ru } = response.data.consts.ncaAuthorityOIDs[oid];
    knownAuthoritiesOptions.push({ text: ru, value: oid });
  });

  Object.keys(response.data.consts.subscriptions).forEach((name) => {
    const { ru } = response.data.consts.subscriptions[name];
    knownSubscriptions.set(name, ru);
  });

  Object.keys(response.data.consts.subscriptionFeatures).forEach((name) => {
    const { ru } = response.data.consts.subscriptionFeatures[name];
    knownSubscriptionFeatures.set(name, ru);
  });

  Object.keys(response.data.consts.certificationAuthorities).forEach((name) => {
    const { ru } = response.data.consts.certificationAuthorities[name];
    knownCertificationAuthorities.push({ text: ru, value: name });
  });
}());

// eslint-disable-next-line no-unused-vars
function translateSeverMessage(serverMessage) {
  const translatedMessage = serverMessages.get(serverMessage);
  if (translatedMessage) {
    return translatedMessage;
  }

  return `Неожиданное сообщение от сервера "${serverMessage}"`;
}

// eslint-disable-next-line no-unused-vars
function isSeverMessageWrongFile(serverMessage) {
  return (serverMessage === 'Signature does not correspond to the document');
}

// eslint-disable-next-line no-unused-vars
function isSeverMessageAuthenticationRequired(serverMessage) {
  return (serverMessage === 'Authentication required');
}

// eslint-disable-next-line no-unused-vars
function isSeverMessageAccessDenied(serverMessage) {
  return (serverMessage === 'Access denied');
}

// eslint-disable-next-line no-unused-vars
function isSeverMessageDDCHasNewSignatures(serverMessage) {
  return (serverMessage === 'Some of digital document card signatures are not registered');
}

// eslint-disable-next-line no-unused-vars
function isSeverMessageDDCIsNewDocument(serverMessage) {
  return (serverMessage === 'Digital document card original document is not registered');
}

// eslint-disable-next-line no-unused-vars
function isSeverMessageNewSignature(serverMessage) {
  return (serverMessage === 'Document not found');
}

// eslint-disable-next-line no-unused-vars
function buildPolicyNameTooltip() {
  return `Известные шаблоны:\n - ${Array.from(knownPolicyIds.values()).join('\n - ')}`;
}

//
// Other tools
//

// eslint-disable-next-line no-unused-vars
async function readBlobToArrayBuffer(blob) {
  if (typeof blob.arrayBuffer === 'function') {
    return blob.arrayBuffer();
  }

  if (typeof blob.stream === 'function') {
    const reader = blob.stream().getReader();

    let uint8Array = new Uint8Array(0);

    let { done, value } = await reader.read();
    while (!done) {
      const newArray = new Int8Array(uint8Array.length + value.length);
      newArray.set(uint8Array);
      newArray.set(value, uint8Array.length);

      uint8Array = newArray;

      // eslint-disable-next-line no-await-in-loop
      ({ done, value } = await reader.read());
    }

    return uint8Array.buffer;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      resolve(loadEvent.target.result);
    };

    reader.readAsArrayBuffer(blob);
  });
}

// eslint-disable-next-line no-unused-vars
function getFilesFromDropEvent(event) {
  const files = [];

  if (!event.dataTransfer) {
    return files;
  }

  if (event.dataTransfer.items) {
    for (let i = 0; i < event.dataTransfer.items.length; i += 1) {
      if (event.dataTransfer.items[i].kind === 'file') {
        const file = event.dataTransfer.items[i].getAsFile();
        files.push(file);
      }
    }
  } else {
    for (let i = 0; i < event.dataTransfer.files.length; i += 1) {
      const file = event.dataTransfer.files[i];
      files.push(file);
    }
  }

  return files;
}

// eslint-disable-next-line no-unused-vars
function parseSubject(subjectStructure) {
  const parsedSubject = {};

  subjectStructure.forEach((rdn) => {
    rdn.forEach((kv) => {
      if (!parsedSubject[kv.name]) {
        parsedSubject[kv.name] = '';
      }

      parsedSubject[kv.name] += kv.value.replace(/\\/gi, '');
    });
  });

  return parsedSubject;
}

// eslint-disable-next-line no-unused-vars
function verifyXIN(xin) {
  const wieghts = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const wieghtsAlternative = [3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2];

  const vals = xin.split('').map((x) => Number(x));
  if (!vals.every((x) => (!Number.isNaN(x)))) {
    return false;
  }

  const control = vals[11];

  let checkControl = 0;
  for (let i = 0; i < 11; i += 1) {
    checkControl += wieghts[i] * vals[i];
  }
  checkControl %= 11;

  if (checkControl === 10) {
    checkControl = 0;
    for (let i = 0; i < 11; i += 1) {
      checkControl += wieghtsAlternative[i] * vals[i];
    }
    checkControl %= 11;
  }

  return control === checkControl;
}
