import { inject, injectable } from "inversify";
import fetch from "node-fetch";
import { TYPES } from "../../configs/types.config";
import YoutubeSearchQuery from "./models/youtube-search-query.model";
import YoutubeSearchResult from "./models/youtube-search-result.model";
import Utils from "../../helpers/utils";

@injectable()
export default class YoutubeService {
  @inject(TYPES.YoutubeToken) private readonly youtubeApiToken: string;
  private readonly youtubeUrl: string = "https://www.youtube.com/";
  private readonly youtubeSearchUrl: string =
    "https://www.googleapis.com/youtube/v3/search/";
  private readonly maxYoutubeSongOptions: number = 5;

  public async getRandomYoutubeOptions(): Promise<YoutubeSearchResult[]> {
    let result: YoutubeSearchResult[] = await this.fetchYoutubeResults(
      new YoutubeSearchQuery()
    );
    let options: YoutubeSearchResult[] = [];
    for (let i = 0; i < this.maxYoutubeSongOptions; ++i) {
      let indexOfRandomSong: number = Utils.getIndexOfRandomValue(result.length);
      options.push(result[indexOfRandomSong]);
      result.splice(indexOfRandomSong, 1);
    }

    return options;
  }


  public async fetchYoutubeResults(
    searchQuery: YoutubeSearchQuery
  ): Promise<YoutubeSearchResult[]> {
    const params = new URLSearchParams(
      YoutubeSearchQuery.convertQueryToHttpParams(searchQuery)
    );
    params.append("key", this.youtubeApiToken);

    let searchUrl: URL = new URL(this.youtubeSearchUrl);
    searchUrl.search = params.toString();

    // TODO: Consider using next page token  to fetch multiple sets at once ~ 150 results
    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((obj) => this.convertResultsIntoUrls(obj));

    return response;
  }

  private convertResultsIntoUrls(youtubeResponse): YoutubeSearchResult[] {
    let result: YoutubeSearchResult[] = youtubeResponse.items.map((item) => {
      return new YoutubeSearchResult(
        item.snippet.title,
        `${this.youtubeUrl}/watch?v=${item.id.videoId}`
      );
    });

    return result;
  }
}
