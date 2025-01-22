/* global SVG */

// eslint-disable-next-line no-unused-vars
function launchLandingAnimations(
  signingSelectorClass,
  sendingSelectorClass,
  verifyingSelectorClass,
) {
  const fillKey = {
    color: '#158f46',
    opacity: 1,
  };
  const fillKeyHole = {
    color: '#edebec',
    opacity: 1,
  };
  const fillSignature = {
    color: '#c7c6c4',
    opacity: 1,
  };
  const fillCloud = {
    color: '#ececec',
    opacity: 1,
  };
  const fillDocument = {
    color: '#6dc287',
    opacity: 1,
  };
  const fillDocumentBad = {
    color: '#5b5b67',
    opacity: 1,
  };
  const fillEditorWidow = {
    opacity: 0,
  };

  const stroke = {
    color: 'black',
    width: 1,
    opacity: 0.78,
    linecap: 'round',
  };
  const strokeRed = {
    color: '#a90000',
    width: 4,
    opacity: 0.85,
    linecap: 'round',
  };
  const strokeGreen = {
    color: '#017534',
    width: 4,
    opacity: 0.85,
    linecap: 'round',
  };

  const animateSlow = 1500;
  const animateFast = 500;

  const keyPattern = 'v -15 '
    + 'v -1 h 9 v -3 h -9 v -1 '
    + 'v -1 h 5 v -3 h -5 v -1 '
    + 'v -1 h 3 v -3 h -3 v -1 '
    + 'v -1 h 4 v -3 h -4 v -1 '
    + 'v -1 h 7 v -3 h -7 v -1 '
    + 'v -1 h 2 v -3 h -2 v -1 '
    + 'v -1 h 9 v -3 h -9 v -1 '
    + 'v -5 ';
  const documentPatterns = [
    'v 3 h -1 c -5 -3, -5 9, 0 6 h 1 v 3 ',
    'v 3 h 1 c 4 -3, 4 9, 0 6 h -1 v 3 ',
    'v 3 c -7 -3, -7 9, 0 6 v 3 ',
  ];
  const documentFlatPatterns = [
    'v 3 h 0 c 0 0, 0 6, 0 6 h 0 v 3 ',
    'v 3 h 0 c 0 0, 0 6, 0 6 h 0 v 3 ',
    'v 3 c 0 0, 0 6, 0 6 v 3 ',
  ];

  //
  // Signing
  //
  async function animateSigning(draw) {
    draw.clear();

    //
    // Editor window
    //
    const editorWindow = draw.path(
      'M 105 5 '
      + 'H 195 '
      + 'V 95 '
      + 'H 105 '
      + 'V 5 '
      + 'M 105 15 '
      + 'H 195 '
      + 'M 185 15 '
      + 'V 5 '
      + 'M 187 13 '
      + 'L 193 7'
      + 'M 193 13'
      + 'L 187 7',
    );

    editorWindow
      .fill(fillEditorWidow)
      .stroke(stroke);

    //
    // Key
    //
    const key = draw.group();
    key.path(`M 55 20 H 45 V 82 C 0 105, 100 105, 55 82 V 75 ${keyPattern}`);

    const keyHole = key.ellipse(10, 5);
    keyHole
      .center(50, 92)
      .fill(fillKeyHole);

    key
      .fill(fillKey)
      .stroke(stroke);

    //
    // Document
    //
    let documentPattern = '';
    let documentFlatPattern = '';
    for (let i = 0; i < 5; i += 1) {
      const documentPatternIndex = Math.round((Math.random() * (documentPatterns.length - 1)));
      documentPattern += documentPatterns[documentPatternIndex];
      documentFlatPattern += documentFlatPatterns[documentPatternIndex];
    }

    const document = draw.group();
    const documentOutline = document.path(
      // eslint-disable-next-line prefer-template
      'M 130 20 '
      + documentFlatPattern
      + 'H 170 '
      + 'V 20 '
      + 'H 130 ',
    );

    await new Promise((resolve) => {
      document
        .fill(fillDocument)
        .stroke(stroke)
        .transform({ scale: 0.1 })
        .animate(animateFast)
        .transform({ scale: 1 })
        .after(resolve);
    });

    await new Promise((resolve) => {
      document.path('M 140 40 h 0 ')
        .animate(animateFast)
        .plot('M 140 40 h 20 ')
        .after(resolve);
    });

    await new Promise((resolve) => {
      document.path('M 140 50 h 0 ')
        .animate(animateFast)
        .plot('M 140 50 h 20 ')
        .after(resolve);
    });

    await new Promise((resolve) => {
      document.path('M 140 60 h 0 ')
        .animate(animateFast)
        .plot('M 140 60 h 20 ')
        .after(resolve);
    });

    await new Promise((resolve) => {
      documentOutline
        .animate(animateSlow)
        .plot(
          // eslint-disable-next-line prefer-template
          'M 130 20 '
          + documentPattern
          + 'H 170 '
          + 'V 20 '
          + 'H 130 ',
        )
        .after(resolve);
    });

    //
    // Signing
    //
    await new Promise((resolve) => {
      key
        .animate(animateSlow)
        .dx(55)
        .after(resolve);
    });

    //
    // Signature
    //
    const signature = draw.path(
      // eslint-disable-next-line prefer-template
      'M 110 75 '
      + keyPattern
      + 'L 130 20 '
      + documentPattern
      + 'L 110 80 '
      + 'Z',
    );
    await new Promise((resolve) => {
      signature
        .fill(fillSignature)
        .fill({ opacity: 0 })
        .stroke(stroke)
        .stroke({ opacity: 0 })
        .animate(animateSlow)
        .fill({ opacity: fillSignature.opacity })
        .stroke({ opacity: stroke.opacity })
        .after(resolve);
    });

    //
    // Reset
    //
    await new Promise((resolve) => {
      key
        .animate(animateSlow)
        .dx(-55)
        .after(resolve);
    });

    await Promise.all([
      new Promise((resolve) => {
        document
          .animate(animateFast)
          .fill({ opacity: 0 })
          .stroke({ opacity: 0 })
          .after(resolve);
      }),
      new Promise((resolve) => {
        signature
          .animate(animateFast)
          .fill({ opacity: 0 })
          .stroke({ opacity: 0 })
          .after(resolve);
      }),
    ]);
  }

  //
  // Storing
  //
  async function animateStoring(draw) {
    draw.clear();

    //
    // Cloud
    //
    const cloud = draw.path(
      'M 54 23 '
      + 'C 54 22 54 20 54 19 '
      + 'C 54 14 50 10 45 10 '
      + 'C 43 10 41 10 40 11 '
      + 'C 37 6 32 3 26 3 '
      + 'C 17 3 10 10 10 19 '
      + 'V 20 '
      + 'C 4 22 0 27 0 34 '
      + 'C 0 42 7 48 14 48 '
      + 'H 51 '
      + 'C 58 48 64 42 64 35 '
      + 'C 64 29 60 24 54 23 '
      + 'Z',
    );

    cloud
      .fill(fillCloud)
      .stroke(stroke)
      .dy(25)
      .dx(5);

    //
    // Document
    //
    let documentPattern = '';
    for (let i = 0; i < 5; i += 1) {
      const documentPatternIndex = Math.round((Math.random() * (documentPatterns.length - 1)));
      documentPattern += documentPatterns[documentPatternIndex];
    }

    const document = draw.group();
    document.path(
      // eslint-disable-next-line prefer-template
      'M 130 20 '
      + documentPattern
      + 'H 170 '
      + 'V 20 '
      + 'H 130 ',
    );
    document.path('M 140 40 h 20 ');
    document.path('M 140 50 h 20 ');
    document.path('M 140 60 h 20 ');

    //
    // Signature
    //
    const signature = draw.path(
      // eslint-disable-next-line prefer-template
      'M 110 75 '
      + keyPattern
      + 'L 130 20 '
      + documentPattern
      + 'L 110 80 '
      + 'Z',
    );

    //
    // Show document and signature
    //
    await Promise.all([
      new Promise((resolve) => {
        document
          .fill(fillDocument)
          .stroke(stroke)
          .transform({ scale: 0.1 })
          .animate(animateSlow)
          .transform({ scale: 1 })
          .after(resolve);
      }),
      new Promise((resolve) => {
        signature
          .fill(fillSignature)
          .stroke(stroke)
          .transform({ scale: 0.1 })
          .animate(animateSlow)
          .transform({ scale: 1 })
          .after(resolve);
      }),
    ]);

    //
    // Send signature to cloud
    //
    await new Promise((resolve) => {
      signature
        .animate(animateSlow)
        .ease('<')
        .dx(-50)
        .animate(animateSlow)
        .ease('>')
        .dx(-120)
        .transform({ scale: 0.3 })
        .after(resolve);
    });
  }

  //
  // Verifying
  //
  async function animateVerifying(draw) {
    draw.clear();

    //
    // Bad document
    //
    let documentPattern = '';
    for (let i = 0; i < 5; i += 1) {
      const documentPatternIndex = Math.round((Math.random() * (documentPatterns.length - 1)));
      documentPattern += documentPatterns[documentPatternIndex];
    }

    const documentBad = draw.group();
    documentBad.path(
      // eslint-disable-next-line prefer-template
      'M 130 20 '
      + documentPattern
      + 'H 170 '
      + 'V 20 '
      + 'H 130 ',
    );
    documentBad.path('M 140 40 h 20 ');
    documentBad.path('M 140 50 h 20 ');
    documentBad.path('M 140 60 h 20 ');
    documentBad
      .fill(fillDocumentBad)
      .fill({ opacity: 0 })
      .stroke(stroke)
      .stroke({ opacity: 0 })
      .transform({ scale: 0.5 })
      .dy(-40);

    //
    // Good document
    //
    const badDocumentPattern = documentPattern;
    while (badDocumentPattern === documentPattern) {
      documentPattern = '';
      for (let i = 0; i < 5; i += 1) {
        const documentPatternIndex = Math.round((Math.random() * (documentPatterns.length - 1)));
        documentPattern += documentPatterns[documentPatternIndex];
      }
    }

    const documentGood = draw.group();
    documentGood.path(
      // eslint-disable-next-line prefer-template
      'M 130 20 '
      + documentPattern
      + 'H 170 '
      + 'V 20 '
      + 'H 130 ',
    );
    documentGood.path('M 140 40 h 20 ');
    documentGood.path('M 140 50 h 20 ');
    documentGood.path('M 140 60 h 20 ');
    documentGood
      .fill(fillDocument)
      .fill({ opacity: 0 })
      .stroke(stroke)
      .stroke({ opacity: 0 })
      .transform({ scale: 0.5 })
      .dy(40);

    //
    // Signature
    //
    const signature = draw.path(
      // eslint-disable-next-line prefer-template
      'M 110 75 '
      + keyPattern
      + 'L 130 20 '
      + documentPattern
      + 'L 110 80 '
      + 'Z',
    );
    signature
      .fill(fillSignature)
      .fill({ opacity: 0 })
      .stroke(stroke)
      .stroke({ opacity: 0 })
      .dx(-100);

    await Promise.all([
      new Promise((resolve) => {
        documentBad
          .animate(animateSlow)
          .fill({ opacity: fillDocumentBad.opacity })
          .stroke({ opacity: stroke.opacity })
          .after(resolve);
      }),
      new Promise((resolve) => {
        documentGood
          .animate(animateSlow)
          .fill({ opacity: fillDocument.opacity })
          .stroke({ opacity: stroke.opacity })
          .after(resolve);
      }),
      new Promise((resolve) => {
        signature
          .animate(animateSlow)
          .fill({ opacity: fillSignature.opacity })
          .stroke({ opacity: stroke.opacity })
          .after(resolve);
      }),
    ]);

    //
    // Check bad document
    //
    await new Promise((resolve) => {
      documentBad
        .animate(animateSlow * 2)
        .dx(-100)
        .dy(40)
        .transform({ scale: 1 })
        .after(resolve);
    });

    const redCross = draw.group();
    redCross.line(15, 25, 65, 75);
    redCross.line(15, 75, 65, 25);
    redCross
      .stroke(strokeRed);

    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    await Promise.all([
      new Promise((resolve) => {
        redCross
          .animate(animateFast)
          .stroke({ opacity: 0 })
          .after(resolve);
      }),
      new Promise((resolve) => {
        documentBad
          .animate(animateFast)
          .stroke({ opacity: 0 })
          .fill({ opacity: 0 })
          .after(resolve);
      }),
    ]);

    //
    // Check good document
    //
    await new Promise((resolve) => {
      documentGood
        .animate(animateSlow * 2)
        .dx(-100)
        .dy(-40)
        .transform({ scale: 1 })
        .after(resolve);
    });

    const greenCheck = draw.group();
    greenCheck.line(15, 35, 35, 75);
    greenCheck.line(35, 75, 65, 25);
    greenCheck
      .stroke(strokeGreen);

    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    await Promise.all([
      new Promise((resolve) => {
        greenCheck
          .animate(animateFast)
          .stroke({ opacity: 0 })
          .after(resolve);
      }),
      new Promise((resolve) => {
        documentGood
          .animate(animateFast)
          .stroke({ opacity: 0 })
          .fill({ opacity: 0 })
          .after(resolve);
      }),
      new Promise((resolve) => {
        signature
          .animate(animateFast)
          .stroke({ opacity: 0 })
          .fill({ opacity: 0 })
          .after(resolve);
      }),
    ]);
  }

  //
  // Launch
  //
  (async () => {
    try {
      const draw = SVG().addTo(signingSelectorClass).size('100%', '100%').viewbox(0, 0, 200, 100);
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        await animateSigning(draw);
      }
    } catch { /* ignore */ }
  })();

  (async () => {
    try {
      const draw = SVG().addTo(sendingSelectorClass).size('100%', '100%').viewbox(0, 0, 200, 100);
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        await animateStoring(draw);
      }
    } catch { /* ignore */ }
  })();

  (async () => {
    try {
      const draw = SVG().addTo(verifyingSelectorClass).size('100%', '100%').viewbox(0, 0, 200, 100);
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        await animateVerifying(draw);
      }
    } catch { /* ignore */ }
  })();
}
