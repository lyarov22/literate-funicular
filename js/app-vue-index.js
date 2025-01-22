/* global Vue, NCALayerClient, knownAuthoritiesOptions, extractIdFromString, localforage,
buildRecommendedFileNames, verifyXIN, axios, translateSeverMessage,
getFilesFromDropEvent, launchLandingAnimations, QRSigningClientCMS,
knownCertificationAuthorities */

// eslint-disable-next-line no-new


new Vue({
  el: "#app-vue-index",

  data: {
    filePath: '',
    isLoading: true,  // Флаг загрузки
    error: null,
    connecting: true,
    ncaLayerNotAwailable: false,
    ncaLayer: new NCALayerClient(),

    qrCodeImage: null,
    eGovMobileLaunchLink: null,
    eGovBusinessLaunchLink: null,

    fileSearchDragging: false,
    fileSearchDraggingError: false,
    fileSearchMouseOver: false,
    fileUploadDragging: false,
    fileUploadDraggingError: false,
    fileUploadMouseOver: false,

    sigexIdInFileName: null,
    selectedFile: null,
    title: null,
    description: null,
    emails: [],
    storageType: null,
    awaitingSignature: false,
    awaitingQRSignature: false,
    fileStorageUsed: false,
    signature: null,
    signed: false,
    emailNotifications: null,
    recommendedTitle: null,
    recommendedTitleWithoutExtension: null,
    documentId: null,
    automaticallyCreatedUserSettings: null,

    showSettings: false,
    settings: {
      private: false,
      signaturesLimit: 0,
      switchToPrivateAfterLimitReached: false,
      unique: [],
      strictSignersRequirements: false,
      signersRequirements: [],
      documentAccess: [],
    },
    settingsHelpers: {
      uniqueIIN: false,
      uniqueBIN: false,
      signersRequirements: [],
      documentAccess: [],
    },
    authoritiesOptions: knownAuthoritiesOptions,
    certificationAuthorities: knownCertificationAuthorities,

    cookieConsentGranted: false,
    requestPersonalDataConsent: false,
  },

  methods: {


    // Existing methods, add this new method
    loadSelectedFile(filePath) {
      if (filePath) {
        // Ищем выбранный файл по пути
        const selectedFile = filePath;
        
        if (selectedFile) {
          // Загружаем файл по пути
          fetch(filePath)
            .then(response => response.blob())
            .then(blob => {
              // Создаем объект File из blob
              const file = new File([blob], selectedFile.name, { type: blob.type });
              
              // Здесь вызываем метод для загрузки файла (например, fileUploadSelected)
              this.fileUploadSelected([file]);
            })
            .catch(error => {
              console.error('Error loading file:', error);
              alert('Не удалось загрузить файл');
            });
        }
      }
    },

    loadSavedFile() {
      this.isLoading = true;  // Устанавливаем флаг загрузки в true
      fetch('/api/file-path/')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          this.isLoading = false;  // Завершаем загрузку
          if (data.error) {
            console.error(data.error);
            return response.json();
        } else {
            // Находим элемент с id 'file-path-container'
            const filePathContainer = document.getElementById('file-path-container');
            
            // Если элемент существует, вставляем туда путь к файлу
            if (filePathContainer) {
                filePathContainer.textContent = `Путь до файла: ${data.file_path}`;
                
            }
            this.loadSelectedFile("http://127.0.0.1:8000/static/files/test1.txt");
        }
        })
        .catch(error => {
          this.isLoading = false;  // Завершаем загрузку
          this.error = 'Ошибка загрузки пути к файлу';  // Показываем ошибку
          console.error('Error loading file path:', error);
          return null;
        });
    },

    newSignersRequirement() {
      return {
        iin: "",
        bin: "",
        authority: "",
        ca: "",
      };
    },

    newDocumentAccessElement() {
      return {
        iin: "",
      };
    },

    async fileSearchSelected(newSelectedFiles) {
      if (!newSelectedFiles || newSelectedFiles.length === 0) {
        return;
      }

      const selectedFileName = newSelectedFiles[0].name;
      const id = extractIdFromString(selectedFileName);

      if (id) {
        try {
          await localforage.setItem("signedDataBlob", newSelectedFiles[0]);
        } catch {
          /* ignore */
        }

        window.location.href = `${this.$refs.showPageLink.href}?id=${id}`;

        return;
      }

      try {
        await localforage.setItem("verifyBlob", newSelectedFiles[0]);
      } catch {
        /* ignore */
      }

      window.location.href = `${this.$refs.verifyPageLink.href}`;
    },

    async fileUploadSelected(newSelectedFiles) {
      // Retry connecting to NCALayer if it was not awailable on launch
      if (this.ncaLayerNotAwailable) {
        this.ncaLayer = new NCALayerClient();
        this.ncaLayerNotAwailable = false;

        try {
          await this.ncaLayer.connect();
          this.connecting = false;
        } catch (err) {
          this.ncaLayerNotAwailable = true;
        }
      }

      if (newSelectedFiles && newSelectedFiles.length > 0) {
        [this.selectedFile] = newSelectedFiles;
        this.title = this.selectedFile.name;
        this.description = this.selectedFile.name;

        const id = extractIdFromString(this.title);
        if (id) {
          this.sigexIdInFileName = id;
        }
      } else {
        this.reloadPage();
      }
    },

    loadDataAndContinueWithQRSign() {
      this.awaitingQRSignature = true;
      this.loadDataAndContinue();
    },

    async loadDataAndContinue(useOldNCALayerUI) {
      this.settings.unique.splice(0);
      if (this.settingsHelpers.uniqueIIN) {
        this.settings.unique.push("iin");
      }
      if (this.settingsHelpers.uniqueBIN) {
        this.settings.unique.push("bin");
      }

      this.settings.signersRequirements.splice(0);
      // eslint-disable-next-line no-restricted-syntax
      for (const signersRequirement of this.settingsHelpers
        .signersRequirements) {
        const newSignersRequirement = {};
        let requirementNotEmpty = false;

        if (signersRequirement.iin) {
          if (!verifyXIN(signersRequirement.iin)) {
            this.error = {
              message: "Введенный ИИН не корректен",
              description: `ИИН ${signersRequirement.iin} не прошел проверку контрольного разряда.`,
            };
            return;
          }
          requirementNotEmpty = true;
          newSignersRequirement.iin = `IIN${signersRequirement.iin}`;
        }

        if (signersRequirement.bin) {
          if (!verifyXIN(signersRequirement.bin)) {
            this.error = {
              message: "Введенный БИН не корректен",
              description: `БИН ${signersRequirement.bin} не прошел проверку контрольного разряда.`,
            };
            return;
          }
          requirementNotEmpty = true;
          newSignersRequirement.bin = `BIN${signersRequirement.bin}`;
        }

        if (signersRequirement.authority) {
          requirementNotEmpty = true;
          newSignersRequirement.authorities = [signersRequirement.authority];
        }

        if (signersRequirement.ca) {
          requirementNotEmpty = true;
          newSignersRequirement.ca = signersRequirement.ca;
        }

        if (requirementNotEmpty) {
          this.settings.signersRequirements.push(newSignersRequirement);
        }
      }

      this.settings.documentAccess.splice(0);
      // eslint-disable-next-line no-restricted-syntax
      for (const documentAccessElement of this.settingsHelpers.documentAccess) {
        const newElement = {};
        let elementNotEmpty = false;

        if (documentAccessElement.iin) {
          if (!verifyXIN(documentAccessElement.iin)) {
            this.error = {
              message: "Введенный ИИН не корректен",
              description: `ИИН ${documentAccessElement.iin} не прошел проверку контрольного разряда.`,
            };
            return;
          }
          elementNotEmpty = true;
          newElement.iin = `IIN${documentAccessElement.iin}`;
        }

        if (elementNotEmpty) {
          this.settings.documentAccess.push(newElement);
        }
      }

      this.awaitingSignature = true;

      if (this.awaitingQRSignature) {
        this.qrSign();
        return;
      }

      if (useOldNCALayerUI) {
        try {
          const storageTypes = await this.ncaLayer.getActiveTokens();

          if (storageTypes.length > 1) {
            this.error = {
              message:
                "Обнаружено несколько разных типов защищенных хранилищ подключенных к компьютеру",
              description:
                "В данный момент поддерживается работа только с одним подключенным устройством. Пожалуйста отключите все лишние устройства и попробуйте еще раз.",
            };
            return;
          }

          if (storageTypes.length === 0) {
            this.fileStorageUsed = true;
            this.storageType = "PKCS12";
            return;
          }

          [this.storageType] = storageTypes;
        } catch (err) {
          this.error = {
            message: "NCALayer вернул неожиданную ошибку",
            description: err,
          };
          return;
        }

        this.sign();
        return;
      }

      this.signBasics();
    },

    async sign() {
      try {
        this.signature = await this.ncaLayer.createCAdESFromBase64(
          this.storageType,
          this.selectedFile
        );
      } catch (err) {
        this.error = {
          message: "NCALayer вернул неожиданную ошибку",
          description: err,
        };
        return;
      }

      this.send();
    },

    async signBasics() {
      try {
        this.signature = await this.ncaLayer.basicsSignCMS(
          NCALayerClient.basicsStoragesAll,
          this.selectedFile,
          NCALayerClient.basicsCMSParamsDetached,
          NCALayerClient.basicsSignerSignAny
        );
      } catch (err) {
        this.error = {
          message: "NCALayer вернул неожиданную ошибку",
          description: err,
        };
        return;
      }

      this.send();
    },

    async qrSign() {
      try {
        const qrSigner = new QRSigningClientCMS(this.description);
        const isPDF = this.title.toLowerCase().endsWith(".pdf");
        await qrSigner.addDataToSign(
          [this.title],
          this.selectedFile,
          [],
          isPDF
        );

        const qrCode = await qrSigner.registerQRSinging();
        this.qrCodeImage = `data:image/gif;base64,${qrCode}`;
        this.eGovMobileLaunchLink = qrSigner.getEGovMobileLaunchLink();
        this.eGovBusinessLaunchLink = qrSigner.getEGovBusinessLaunchLink();

        [this.signature] = await qrSigner.getSignatures(() => {
          this.qrCodeImage = null;
        });
      } catch (err) {
        this.error = {
          message: err,
          description: err.details,
        };
        return;
      }

      this.awaitingQRSignature = false;

      this.send();
    },

    async send() {
      try {
        const emailNotifications = {
          to: this.emails.map((email) => email.to).filter((email) => !!email),
        };

        let response = await axios.post("https://sigex.kz/api", {
          title: this.title,
          description: this.description,
          signature: this.signature,
          emailNotifications,
          settings: this.settings,
        });

        if (response.data.message) {
          this.error = {
            message: "Сервер не принял подпись",
            description: translateSeverMessage(response.data.message),
          };
          return;
        }

        const {
          data: { documentId },
        } = response;

        response = await axios.post(
          `https://sigex.kz/api/${documentId}/data`,
          this.selectedFile,
          { headers: { "Content-Type": "application/octet-stream" } }
        );

        if (response.data.message) {
          this.error = {
            message:
              "Сервер не принял подпись (проблема с проверкой подписанных данных)",
            description: translateSeverMessage(response.data.message),
          };
          return;
        }

        this.emailNotifications = response.data.emailNotifications;
        if (this.emailNotifications && this.emailNotifications.message) {
          this.emailNotifications = null;
        }

        this.automaticallyCreatedUserSettings =
          response.data.automaticallyCreatedUserSettings;

        this.awaitingSignature = false;

        this.signed = true;
        this.documentId = documentId;

        const { recommendedTitle, recommendedTitleWithoutExtension } =
          buildRecommendedFileNames(this.title, this.documentId);

        this.recommendedTitle = recommendedTitle;
        this.recommendedTitleWithoutExtension =
          recommendedTitleWithoutExtension;
      } catch (err) {
        this.error = {
          message: "Сервер вернул неожиданную ошибку",
          description: err,
        };
      }
    },

    forceSignWithFile() {
      this.fileStorageUsed = false;
      this.sign();
    },

    reloadPage() {
      window.location.reload(true);
    },

    showSignedDocument() {
      window.location.href = `https://sigex.kz/show?id=${this.documentId}`;
      // window.location.href = `${this.$refs.showPageLink.href}?id=${this.documentId}`;
    },

    showAlreadySignedDocument() {
      window.location.href = `https://sigex.kz/show?id=${this.sigexIdInFileName}`;
      // window.location.href = `${this.$refs.showPageLink.href}?id=${this.sigexIdInFileName}`;
    },

    async copyRecommendedTitleToClipboard() {
      await navigator.clipboard.writeText(this.recommendedTitle);
    },

    async copyRecommendedTitleWithoutExtensionToClipboard() {
      await navigator.clipboard.writeText(
        this.recommendedTitleWithoutExtension
      );
    },

    //
    // Search area handling
    //
    fileSearchDraggingStarted(event) {
      this.fileSearchDragging = true;

      const files = getFilesFromDropEvent(event);
      if (files.length > 1) {
        this.fileSearchDraggingError = true;
      }
    },

    fileSearchDropped(event) {
      this.fileSearchDraggingStopped(event);

      const files = getFilesFromDropEvent(event);
      if (files.length === 1) {
        this.fileSearchSelected(files);
      }
    },

    fileSearchDraggingStopped() {
      this.fileSearchDragging = false;
      this.fileSearchDraggingError = false;
    },

    //
    // Upload area handling
    //
    fileUploadDraggingStarted(event) {
      this.fileUploadDragging = true;

      const files = getFilesFromDropEvent(event);
      if (files.length > 1) {
        this.fileUploadDraggingError = true;
      }
    },

    fileUploadDropped(event) {
      this.fileUploadDraggingStopped(event);

      const files = getFilesFromDropEvent(event);
      if (files.length === 1) {
        this.fileUploadSelected(files);
      }
    },

    fileUploadDraggingStopped() {
      this.fileUploadDragging = false;
      this.fileUploadDraggingError = false;
    },

    grantPersonalDataConsent() {
      if (this.cookieConsentGranted) {
        this.requestPersonalDataConsent = false;
        localStorage.setItem("personalDataConsent", "granted");
      }
    },
  },

  

  async mounted() {
  
    this.loadSavedFile()
    
    if (localStorage.getItem("cookieConsent") === "granted") {
      this.cookieConsentGranted = true;
    }

    if (localStorage.getItem("personalDataConsent") !== "granted") {
      this.requestPersonalDataConsent = true;
    }

    localforage.config({
      name: "https://sigex.kz",
      storeName: "sigexkzstore",
    });

    try {
      await this.ncaLayer.connect();
      this.connecting = false;
    } catch (err) {
      this.connecting = false;
      this.ncaLayerNotAwailable = true;
    }

    launchLandingAnimations(
      ".animation-signing",
      ".animation-sending",
      ".animation-verifying"
    );
  },
});
