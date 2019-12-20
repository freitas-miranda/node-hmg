export default function () {
  return {
    css: `
    .topbar {
      background: linear-gradient(150deg, #00516c 15%, #004861 70%, #004056 100%) !important;
    }
    .topbar img {
      content:url("${process.env.APP_HOST}:${process.env.APP_PORT}/img/icons/apple-touch-icon-60x60.png");
      height: 50px
    }`,

    icon: "/img/icons/android-chrome-512x512.png",
    pageTitle: "Documentação de API"
  };
}
