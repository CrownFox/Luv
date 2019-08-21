var $ = require('jquery')
var defs = require('./../definitions')
var common = require('./../common')

class danbooru
{
    constructor()
    {
        this.page = 1
        this.last_id = 0
        this.tags = null
        this.loading = false
        this.thumbnail_override = {
            width: '170px',
            height: '170px'
        }
        this.firstload = false
    }

    fetch_list(tags = null, page, callback = (posts) => {})
    {
        this.page = page

        var URL = `https://danbooru.donmai.us/posts.json?page=${page}&limit=50`

        //Check for user supplied tags
        URL += common.parse_tags(this, tags)

        $.get(URL, (response) =>
        {
            //var ghost = document.implementation.createHTMLDocument('virtual')
            // Ghost isn't needed for E621, since E621's API is freely available

            var posts = {}

            $.each(response, (index, post) =>
            {
                var newpost = new defs.thumb(post.id)

                newpost.sample_url = post.preview_file_url
                newpost.sample_height = post.image_height
                newpost.sample_width = post.image_width
                newpost.tags = post.tag_string.split(' ')
                newpost.file_ext = post.file_ext
                var video_types = ['mp4', 'webm', 'zip']

                if (post.file_ext == 'swf')
                {
                    newpost.sample_url = './assets/images/UI/flash.png'
                }
                if (video_types.indexOf(post.file_ext) != -1)
                {
                    newpost.format = 'video'
                }
                else
                {
                    newpost.format = 'image'
                }

                posts[post.id] = newpost

                this.last_id = post.id
            })

            console.log(URL)
            console.log(response)
            callback(posts)
        })
    }

    fetch_post(id, callback = (post) => {})
    {
        var URL = `https://danbooru.donmai.us/posts/${id}.json`

        $.get(URL, (response) =>
        {
            //var ghost = document.implementation.createHTMLDocument('virtual')
            // Ghost isn't needed for E621, since E621's API is freely available

            var post = response
            var newpost = new defs.post(post.id)

            newpost.file_url = post.large_file_url
            newpost.file_height = post.image_height
            newpost.file_width = post.image_width
            newpost.file_ext = post.file_ext
            newpost.tags = post.tag_string.split(' ')

            var video_types = ['mp4', 'webm', 'zip']
            if (video_types.indexOf(post.file_ext) != -1)
            {
                newpost.format = 'video'
            }
            else
            {
                newpost.format = 'image'
            }

            console.log(URL)
            console.log(response)
            callback(newpost)
        })
    }
}

module.exports = new danbooru