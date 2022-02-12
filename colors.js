const styles = {
  "CI&T": {
    "--primary-color": "#ed1941",
    "--primary-color-c": "#ffffff",

    "--secondary-color": "#20bec6",
    "--secondary-color-c": "#ffffff",

    "--menu-color": "#20bec6",
    "--menu-color-s": "#20bec62d",

    "--error": "#f31143",
    "--gray": "#eeeeee",
    "--gray-s": "#88888850",
    "--gray1": "#888888",
    "--gray1-s": "#43434357",
    "--gray2": "#434343",
    "--link": "#1155cc",

    "--text-color": "#434343",
    "--url-login": 'url("/img/ciet-logo-test.png")',
  },
  BEES: {
    "--primary-color": "#ffff00",
    "--primary-color-c": "#000000",

    "--secondary-color": "#000000",
    "--secondary-color-c": "#ffffff",

    "--menu-color": "#00a2ff",
    "--menu-color-s": "#00a2ff48",

    "--error": "#f31143",
    "--gray": "#f0ecfc",
    "--gray-s": "#9a97a59",
    "--gray1": "#9a97a1",
    "--gray1-s": "#3d3c4057",
    "--gray2": "#3d3c40",
    "--link": "#4d6edb",

    "--text-color": "#3d3c40",
    "--url-login": 'url("/img/bees-logo-test.png")',
  },
};

const MESSAGESTYLE = "__Style__";
const GETMESSAGESTYLES = "__GetStyles__";

function stylePage(who) {
  for (const [nameStyle, valueStyle] of Object.entries(styles[who])) {
    document.documentElement.style.setProperty(nameStyle, valueStyle);
  }
}
