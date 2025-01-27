import * as cheerio from 'cheerio';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  return await fetchData(params.table);
}

async function fetchData(tableURL) {
  if (!tableURL) return {error: "Missing URL"}

  try {
    const response = await fetch(tableURL);
    const html = await response.text();

    const $ = cheerio.load(html);
    const tableBody = $("section.league-group-scores > .section-content > table > tbody");
  
    const teams = tableBody.find("tr > td:nth-child(2) > a > span.table-cell-item:nth-child(3)").toArray().map(el => $(el).text());
    const logos = tableBody.find("tr > td:nth-child(2) > a > span.table-cell-item:nth-child(1) > img").toArray().map(el => $(el).attr("data-src"));
    const wins = tableBody.find("tr > td:nth-child(3) > a").toArray().map(el => parseInt($(el).text(), 10));
    const losses = tableBody.find("tr > td:nth-child(4) > a").toArray().map(el => parseInt($(el).text(), 10));
    
    const league = $('.page-title').text();

    if (!teams.length) return {error: "Not a valid URL"}
  
    return {teams: teams.map((team, i) => ({name: team, wins: wins[i], losses: losses[i], logo: logos[i]})), leaguename: league};
  } catch(err) {
    return {error: "Failed to parse URL"}
  }
}