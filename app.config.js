export default {
  expo: {
    name: "CNN Milk",
    slug: "cnn-farm-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/logo.png",
    scheme: "cnnfarmapp",
    userInterfaceStyle: "automatic",
    android: {
      adaptiveIcon: {
        backgroundColor: "#143219",
        foregroundImage: "./assets/logo.png"
      },
      predictiveBackGestureEnabled: false,
      package: "com.cnnmilk.app",
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json"
    },
    web: {
      output: "static",
      favicon: "./assets/logo.png"
    },
    plugins: [
      "expo-router",
      "expo-image",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#143219",
          image: "./assets/logo.png",
          imageWidth: 200
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      router: {},
      eas: {
        projectId: "8cfb4954-5b58-4ba5-aff8-de3ca41761fd"
      }
    }
  }
};