// Starter athlete list.
// born: birth date (age is worked out from today's date)
// height: centimetres
// netWorth: estimated net worth in millions of US dollars (public estimates, rounded; update as needed)
// continent: used for the "close" hint on nationality
// wiki: Wikipedia page title for the photo, only needed when it differs from the name
const ATHLETES = [
  { name: "Lionel Messi", sport: "Soccer", nationality: "Argentina", continent: "South America", born: "1987-06-24", height: 170, netWorth: 850, gender: "M" },
  { name: "Cristiano Ronaldo", sport: "Soccer", nationality: "Portugal", continent: "Europe", born: "1985-02-05", height: 187, netWorth: 950, gender: "M" },
  { name: "Kylian Mbappé", sport: "Soccer", nationality: "France", continent: "Europe", born: "1998-12-20", height: 178, netWorth: 200, gender: "M" },
  { name: "Erling Haaland", sport: "Soccer", nationality: "Norway", continent: "Europe", born: "2000-07-21", height: 195, netWorth: 80, gender: "M" },
  { name: "Neymar", sport: "Soccer", nationality: "Brazil", continent: "South America", born: "1992-02-05", height: 175, netWorth: 250, gender: "M" },
  { name: "Mohamed Salah", sport: "Soccer", nationality: "Egypt", continent: "Africa", born: "1992-06-15", height: 175, netWorth: 110, gender: "M" },
  { name: "Harry Kane", sport: "Soccer", nationality: "England", continent: "Europe", born: "1993-07-28", height: 188, netWorth: 90, gender: "M" },
  { name: "Kevin De Bruyne", sport: "Soccer", nationality: "Belgium", continent: "Europe", born: "1991-06-28", height: 181, netWorth: 100, gender: "M" },
  { name: "Jude Bellingham", sport: "Soccer", nationality: "England", continent: "Europe", born: "2003-06-29", height: 186, netWorth: 30, gender: "M" },
  { name: "Robert Lewandowski", sport: "Soccer", nationality: "Poland", continent: "Europe", born: "1988-08-21", height: 185, netWorth: 100, gender: "M" },
  { name: "Luka Modrić", sport: "Soccer", nationality: "Croatia", continent: "Europe", born: "1985-09-09", height: 172, netWorth: 50, gender: "M" },
  { name: "Son Heung-min", sport: "Soccer", nationality: "South Korea", continent: "Asia", born: "1992-07-08", height: 183, netWorth: 60, gender: "M" },
  { name: "Vinícius Júnior", sport: "Soccer", nationality: "Brazil", continent: "South America", born: "2000-07-12", height: 176, netWorth: 40, gender: "M" },
  { name: "Alexia Putellas", sport: "Soccer", nationality: "Spain", continent: "Europe", born: "1994-02-04", height: 173, netWorth: 3, gender: "F" },
  { name: "Megan Rapinoe", sport: "Soccer", nationality: "USA", continent: "North America", born: "1985-07-05", height: 168, netWorth: 7, gender: "F" },

  { name: "LeBron James", sport: "Basketball", nationality: "USA", continent: "North America", born: "1984-12-30", height: 206, netWorth: 1200, gender: "M" },
  { name: "Stephen Curry", sport: "Basketball", nationality: "USA", continent: "North America", born: "1988-03-14", height: 188, netWorth: 200, gender: "M" },
  { name: "Kevin Durant", sport: "Basketball", nationality: "USA", continent: "North America", born: "1988-09-29", height: 211, netWorth: 300, gender: "M" },
  { name: "Giannis Antetokounmpo", sport: "Basketball", nationality: "Greece", continent: "Europe", born: "1994-12-06", height: 211, netWorth: 150, gender: "M" },
  { name: "Nikola Jokić", sport: "Basketball", nationality: "Serbia", continent: "Europe", born: "1995-02-19", height: 211, netWorth: 90, gender: "M" },
  { name: "Luka Dončić", sport: "Basketball", nationality: "Slovenia", continent: "Europe", born: "1999-02-28", height: 201, netWorth: 60, gender: "M" },
  { name: "Victor Wembanyama", sport: "Basketball", nationality: "France", continent: "Europe", born: "2004-01-04", height: 224, netWorth: 20, gender: "M" },
  { name: "Shai Gilgeous-Alexander", sport: "Basketball", nationality: "Canada", continent: "North America", born: "1998-07-12", height: 198, netWorth: 50, gender: "M" },
  { name: "Michael Jordan", sport: "Basketball", nationality: "USA", continent: "North America", born: "1963-02-17", height: 198, netWorth: 3500, gender: "M" },
  { name: "Shaquille O'Neal", sport: "Basketball", nationality: "USA", continent: "North America", born: "1972-03-06", height: 216, netWorth: 500, gender: "M" },
  { name: "Caitlin Clark", sport: "Basketball", nationality: "USA", continent: "North America", born: "2002-01-22", height: 183, netWorth: 5, gender: "F" },
  { name: "Yao Ming", sport: "Basketball", nationality: "China", continent: "Asia", born: "1980-09-12", height: 229, netWorth: 160, gender: "M" },
  { name: "Dirk Nowitzki", sport: "Basketball", nationality: "Germany", continent: "Europe", born: "1978-06-19", height: 213, netWorth: 160, gender: "M" },

  { name: "Tom Brady", sport: "American Football", nationality: "USA", continent: "North America", born: "1977-08-03", height: 193, netWorth: 300, gender: "M" },
  { name: "Patrick Mahomes", sport: "American Football", nationality: "USA", continent: "North America", born: "1995-09-17", height: 188, netWorth: 90, gender: "M" },
  { name: "Travis Kelce", sport: "American Football", nationality: "USA", continent: "North America", born: "1989-10-05", height: 196, netWorth: 90, gender: "M" },
  { name: "Aaron Rodgers", sport: "American Football", nationality: "USA", continent: "North America", born: "1983-12-02", height: 188, netWorth: 200, gender: "M" },
  { name: "Josh Allen", wiki: "Josh Allen (quarterback)", sport: "American Football", nationality: "USA", continent: "North America", born: "1996-05-21", height: 196, netWorth: 50, gender: "M" },

  { name: "Shohei Ohtani", sport: "Baseball", nationality: "Japan", continent: "Asia", born: "1994-07-05", height: 193, netWorth: 200, gender: "M" },
  { name: "Aaron Judge", sport: "Baseball", nationality: "USA", continent: "North America", born: "1992-04-26", height: 201, netWorth: 100, gender: "M" },
  { name: "Derek Jeter", sport: "Baseball", nationality: "USA", continent: "North America", born: "1974-06-26", height: 191, netWorth: 200, gender: "M" },
  { name: "Juan Soto", sport: "Baseball", nationality: "Dominican Republic", continent: "North America", born: "1998-10-25", height: 188, netWorth: 60, gender: "M" },

  { name: "Roger Federer", sport: "Tennis", nationality: "Switzerland", continent: "Europe", born: "1981-08-08", height: 185, netWorth: 550, gender: "M" },
  { name: "Rafael Nadal", sport: "Tennis", nationality: "Spain", continent: "Europe", born: "1986-06-03", height: 185, netWorth: 220, gender: "M" },
  { name: "Novak Djokovic", sport: "Tennis", nationality: "Serbia", continent: "Europe", born: "1987-05-22", height: 188, netWorth: 250, gender: "M" },
  { name: "Carlos Alcaraz", sport: "Tennis", nationality: "Spain", continent: "Europe", born: "2003-05-05", height: 183, netWorth: 40, gender: "M" },
  { name: "Jannik Sinner", sport: "Tennis", nationality: "Italy", continent: "Europe", born: "2001-08-16", height: 191, netWorth: 50, gender: "M" },
  { name: "Serena Williams", sport: "Tennis", nationality: "USA", continent: "North America", born: "1981-09-26", height: 175, netWorth: 340, gender: "F" },
  { name: "Venus Williams", sport: "Tennis", nationality: "USA", continent: "North America", born: "1980-06-17", height: 185, netWorth: 95, gender: "F" },
  { name: "Naomi Osaka", sport: "Tennis", nationality: "Japan", continent: "Asia", born: "1997-10-16", height: 180, netWorth: 50, gender: "F" },
  { name: "Coco Gauff", sport: "Tennis", nationality: "USA", continent: "North America", born: "2004-03-13", height: 175, netWorth: 30, gender: "F" },
  { name: "Iga Świątek", sport: "Tennis", nationality: "Poland", continent: "Europe", born: "2001-05-31", height: 176, netWorth: 35, gender: "F" },
  { name: "Aryna Sabalenka", sport: "Tennis", nationality: "Belarus", continent: "Europe", born: "1998-05-05", height: 182, netWorth: 30, gender: "F" },
  { name: "Maria Sharapova", sport: "Tennis", nationality: "Russia", continent: "Europe", born: "1987-04-19", height: 188, netWorth: 180, gender: "F" },

  { name: "Tiger Woods", sport: "Golf", nationality: "USA", continent: "North America", born: "1975-12-30", height: 185, netWorth: 1300, gender: "M" },
  { name: "Rory McIlroy", sport: "Golf", nationality: "Northern Ireland", continent: "Europe", born: "1989-05-04", height: 175, netWorth: 230, gender: "M" },
  { name: "Scottie Scheffler", sport: "Golf", nationality: "USA", continent: "North America", born: "1996-06-21", height: 191, netWorth: 100, gender: "M" },
  { name: "Phil Mickelson", sport: "Golf", nationality: "USA", continent: "North America", born: "1970-06-16", height: 191, netWorth: 400, gender: "M" },

  { name: "Lewis Hamilton", sport: "Formula 1", nationality: "England", continent: "Europe", born: "1985-01-07", height: 174, netWorth: 300, gender: "M" },
  { name: "Max Verstappen", sport: "Formula 1", nationality: "Netherlands", continent: "Europe", born: "1997-09-30", height: 181, netWorth: 200, gender: "M" },
  { name: "Charles Leclerc", sport: "Formula 1", nationality: "Monaco", continent: "Europe", born: "1997-10-16", height: 180, netWorth: 50, gender: "M" },
  { name: "Lando Norris", sport: "Formula 1", nationality: "England", continent: "Europe", born: "1999-11-13", height: 170, netWorth: 40, gender: "M" },
  { name: "Fernando Alonso", sport: "Formula 1", nationality: "Spain", continent: "Europe", born: "1981-07-29", height: 171, netWorth: 260, gender: "M" },
  { name: "Michael Schumacher", sport: "Formula 1", nationality: "Germany", continent: "Europe", born: "1969-01-03", height: 174, netWorth: 600, gender: "M" },

  { name: "Usain Bolt", sport: "Athletics", nationality: "Jamaica", continent: "North America", born: "1986-08-21", height: 195, netWorth: 90, gender: "M" },
  { name: "Mondo Duplantis", sport: "Athletics", nationality: "Sweden", continent: "Europe", born: "1999-11-10", height: 181, netWorth: 10, gender: "M" },
  { name: "Sha'Carri Richardson", sport: "Athletics", nationality: "USA", continent: "North America", born: "2000-03-25", height: 155, netWorth: 3, gender: "F" },
  { name: "Eliud Kipchoge", sport: "Athletics", nationality: "Kenya", continent: "Africa", born: "1984-11-05", height: 167, netWorth: 8, gender: "M" },
  { name: "Noah Lyles", sport: "Athletics", nationality: "USA", continent: "North America", born: "1997-07-18", height: 180, netWorth: 7, gender: "M" },

  { name: "Michael Phelps", sport: "Swimming", nationality: "USA", continent: "North America", born: "1985-06-30", height: 193, netWorth: 100, gender: "M" },
  { name: "Katie Ledecky", sport: "Swimming", nationality: "USA", continent: "North America", born: "1997-03-17", height: 183, netWorth: 4, gender: "F" },
  { name: "Léon Marchand", sport: "Swimming", nationality: "France", continent: "Europe", born: "2002-05-17", height: 187, netWorth: 5, gender: "M" },

  { name: "Simone Biles", sport: "Gymnastics", nationality: "USA", continent: "North America", born: "1997-03-14", height: 142, netWorth: 25, gender: "F" },

  { name: "Conor McGregor", sport: "MMA", nationality: "Ireland", continent: "Europe", born: "1988-07-14", height: 175, netWorth: 200, gender: "M" },
  { name: "Jon Jones", sport: "MMA", nationality: "USA", continent: "North America", born: "1987-07-19", height: 193, netWorth: 15, gender: "M" },
  { name: "Khabib Nurmagomedov", sport: "MMA", nationality: "Russia", continent: "Europe", born: "1988-09-20", height: 178, netWorth: 50, gender: "M" },
  { name: "Ronda Rousey", sport: "MMA", nationality: "USA", continent: "North America", born: "1987-02-01", height: 170, netWorth: 13, gender: "F" },

  { name: "Floyd Mayweather", sport: "Boxing", nationality: "USA", continent: "North America", born: "1977-02-24", height: 173, netWorth: 400, gender: "M" },
  { name: "Canelo Álvarez", sport: "Boxing", nationality: "Mexico", continent: "North America", born: "1990-07-18", height: 173, netWorth: 275, gender: "M" },
  { name: "Tyson Fury", sport: "Boxing", nationality: "England", continent: "Europe", born: "1988-08-12", height: 206, netWorth: 150, gender: "M" },
  { name: "Anthony Joshua", sport: "Boxing", nationality: "England", continent: "Europe", born: "1989-10-15", height: 198, netWorth: 150, gender: "M" },
  { name: "Mike Tyson", sport: "Boxing", nationality: "USA", continent: "North America", born: "1966-06-30", height: 178, netWorth: 10, gender: "M" },
  { name: "Manny Pacquiao", sport: "Boxing", nationality: "Philippines", continent: "Asia", born: "1978-12-17", height: 166, netWorth: 220, gender: "M" },

  { name: "Virat Kohli", sport: "Cricket", nationality: "India", continent: "Asia", born: "1988-11-05", height: 175, netWorth: 120, gender: "M" },
  { name: "MS Dhoni", sport: "Cricket", nationality: "India", continent: "Asia", born: "1981-07-07", height: 175, netWorth: 120, gender: "M" },
  { name: "Sachin Tendulkar", sport: "Cricket", nationality: "India", continent: "Asia", born: "1973-04-24", height: 165, netWorth: 170, gender: "M" },
  { name: "Babar Azam", sport: "Cricket", nationality: "Pakistan", continent: "Asia", born: "1994-10-15", height: 180, netWorth: 6, gender: "M" },
  { name: "Ben Stokes", sport: "Cricket", nationality: "England", continent: "Europe", born: "1991-06-04", height: 185, netWorth: 15, gender: "M" },

  { name: "Wayne Gretzky", sport: "Ice Hockey", nationality: "Canada", continent: "North America", born: "1961-01-26", height: 183, netWorth: 250, gender: "M" },
  { name: "Sidney Crosby", sport: "Ice Hockey", nationality: "Canada", continent: "North America", born: "1987-08-07", height: 180, netWorth: 90, gender: "M" },
  { name: "Connor McDavid", sport: "Ice Hockey", nationality: "Canada", continent: "North America", born: "1997-01-13", height: 185, netWorth: 80, gender: "M" },
  { name: "Alex Ovechkin", sport: "Ice Hockey", nationality: "Russia", continent: "Europe", born: "1985-09-17", height: 191, netWorth: 120, gender: "M" },

  { name: "Lindsey Vonn", sport: "Skiing", nationality: "USA", continent: "North America", born: "1984-10-18", height: 178, netWorth: 12, gender: "F" },
  { name: "Mikaela Shiffrin", sport: "Skiing", nationality: "USA", continent: "North America", born: "1995-03-13", height: 170, netWorth: 10, gender: "F" },
  { name: "Shaun White", sport: "Snowboarding", nationality: "USA", continent: "North America", born: "1986-09-03", height: 173, netWorth: 60, gender: "M" },
  { name: "Tony Hawk", sport: "Skateboarding", nationality: "USA", continent: "North America", born: "1968-05-12", height: 188, netWorth: 140, gender: "M" },

  { name: "Beauden Barrett", sport: "Rugby", nationality: "New Zealand", continent: "Oceania", born: "1991-05-27", height: 187, netWorth: 5, gender: "M" },
  { name: "Antoine Dupont", sport: "Rugby", nationality: "France", continent: "Europe", born: "1996-11-15", height: 174, netWorth: 5, gender: "M" },
];
