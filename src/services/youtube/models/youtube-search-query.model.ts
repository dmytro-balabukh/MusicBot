import { YoutubeMusicTopic } from "../../../enums/youtube-music-topic.enums";

export default class YoutubeSearchQuery {
    // Count of returning videos
    private readonly maxResults: number = 50;
    private readonly type: string = 'video';
    // 10 category is music
    private readonly videoCategoryId: number = 10;
    // Allows to include music title, url etc
    private readonly part = "snippet";


    public topicId: YoutubeMusicTopic = YoutubeMusicTopic.All;
    public searchKeyword: string;

    constructor(topicId?: YoutubeMusicTopic, searchKeyword?: string) {
        this.topicId = topicId;
        this.searchKeyword = searchKeyword;
    }

    public static convertQueryToHttpParams(query?: YoutubeSearchQuery): URLSearchParams {
        let params: string[][] = [
            ['maxResults', query.maxResults?.toString()],
            ['type', query.type?.toString()],
            ['part', query.part?.toString()],
            ['videoCategoryId', query.videoCategoryId?.toString()],
            ['order', 'viewCount'],
            ['topicId', YoutubeMusicTopic.Rock],
            //['topicId', query.topicId?.toString()],
            ['q', 'metal'],
           // ['q', query.searchKeyword?.toString()],
        ].filter(param => param[1] != null);

        return new URLSearchParams(params);
    }
}