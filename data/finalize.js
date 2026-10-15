// Fills in league/conference for US leagues, country names and continents, and removes duplicate names.
(() => {
  const CONF = {
    Basketball: {
      "NBA East": ["Atlanta Hawks", "Boston Celtics", "Brooklyn Nets", "Charlotte Hornets", "Chicago Bulls", "Cleveland Cavaliers",
        "Detroit Pistons", "Indiana Pacers", "Miami Heat", "Milwaukee Bucks", "New York Knicks", "Orlando Magic",
        "Philadelphia 76ers", "Toronto Raptors", "Washington Wizards"],
      "NBA West": ["Dallas Mavericks", "Denver Nuggets", "Golden State Warriors", "Houston Rockets", "LA Clippers",
        "Los Angeles Lakers", "Memphis Grizzlies", "Minnesota Timberwolves", "New Orleans Pelicans", "Oklahoma City Thunder",
        "Phoenix Suns", "Portland Trail Blazers", "Sacramento Kings", "San Antonio Spurs", "Utah Jazz"],
    },
    "American Football": {
      AFC: ["Baltimore Ravens", "Buffalo Bills", "Cincinnati Bengals", "Cleveland Browns", "Denver Broncos", "Houston Texans",
        "Indianapolis Colts", "Jacksonville Jaguars", "Kansas City Chiefs", "Las Vegas Raiders", "Los Angeles Chargers",
        "Miami Dolphins", "New England Patriots", "New York Jets", "Pittsburgh Steelers", "Tennessee Titans"],
      NFC: ["Arizona Cardinals", "Atlanta Falcons", "Carolina Panthers", "Chicago Bears", "Dallas Cowboys", "Detroit Lions",
        "Green Bay Packers", "Los Angeles Rams", "Minnesota Vikings", "New Orleans Saints", "New York Giants",
        "Philadelphia Eagles", "San Francisco 49ers", "Seattle Seahawks", "Tampa Bay Buccaneers", "Washington Commanders"],
    },
    Baseball: {
      "American League": ["Baltimore Orioles", "Boston Red Sox", "New York Yankees", "Tampa Bay Rays", "Toronto Blue Jays",
        "Chicago White Sox", "Cleveland Guardians", "Detroit Tigers", "Kansas City Royals", "Minnesota Twins",
        "Houston Astros", "Los Angeles Angels", "Athletics", "Seattle Mariners", "Texas Rangers"],
      "National League": ["Atlanta Braves", "Miami Marlins", "New York Mets", "Philadelphia Phillies", "Washington Nationals",
        "Chicago Cubs", "Cincinnati Reds", "Milwaukee Brewers", "Pittsburgh Pirates", "St. Louis Cardinals",
        "Arizona Diamondbacks", "Colorado Rockies", "Los Angeles Dodgers", "San Diego Padres", "San Francisco Giants"],
    },
    "Ice Hockey": {
      "NHL East": ["Boston Bruins", "Buffalo Sabres", "Detroit Red Wings", "Florida Panthers", "Montreal Canadiens",
        "Ottawa Senators", "Tampa Bay Lightning", "Toronto Maple Leafs", "Carolina Hurricanes", "Columbus Blue Jackets",
        "New Jersey Devils", "New York Islanders", "New York Rangers", "Philadelphia Flyers", "Pittsburgh Penguins",
        "Washington Capitals"],
      "NHL West": ["Utah Mammoth", "Chicago Blackhawks", "Colorado Avalanche", "Dallas Stars", "Minnesota Wild",
        "Nashville Predators", "St. Louis Blues", "Winnipeg Jets", "Anaheim Ducks", "Calgary Flames", "Edmonton Oilers",
        "Los Angeles Kings", "San Jose Sharks", "Seattle Kraken", "Vancouver Canucks", "Vegas Golden Knights"],
    },
  };
  const confOf = {};
  for (const [sport, confs] of Object.entries(CONF))
    for (const [conf, teams] of Object.entries(confs)) for (const t of teams) confOf[sport + "|" + t] = conf;

  COUNTRIES.BA ||= ["Bosnia and Herzegovina", "Europe", "ba"];
  COUNTRIES.ME ||= ["Montenegro", "Europe", "me"];

  const seen = new Set();
  for (let i = 0; i < ATHLETES.length; i++) {
    const a = ATHLETES[i];
    if (seen.has(a.name)) { ATHLETES.splice(i--, 1); continue; }
    seen.add(a.name);
    if (!a.league) a.league = confOf[a.sport + "|" + a.team] || "";
    const c = COUNTRIES[a.nat] || [a.nat, "Other", ""];
    a.nationality = c[0]; a.continent = c[1]; a.flag = c[2];
  }
})();
