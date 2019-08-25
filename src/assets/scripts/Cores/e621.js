var $ = require('jquery')
var defs = require('../definitions')
var common = require('../common')

class e621
{
    constructor()
    {
        this.page = 1
        this.last_id = 0
        this.tags = null
        this.loading = false
        this.firstload = false
    }

    fetch_list(tags = null, page, callback = (posts) => {})
    {
        this.page = page

        var URL = `http://e621.net/post/index.json?limit=50&page=${page}`

        //Check for user supplied tags
        URL += common.parse_tags(this, tags)

        if (page > 1) //Prevent duplicate thumbnails from appearing
        {
            URL += `&before_id=${this.last_id}`
        }

        $.get(URL, (response) =>
        {
            //var ghost = document.implementation.createHTMLDocument('virtual')
            // Ghost isn't needed for E621, since E621's API is freely available

            var posts = {}

            $.each(response, (index, post) =>
            {
                var newpost = new defs.thumb(post.id)

                newpost.sample_url = post.sample_url
                newpost.sample_height = post.sample_height
                newpost.sample_width = post.sample_width
                newpost.file_ext = post.file_ext
                newpost.tags = post.tags

                if (post.file_ext == 'swf')
                {
                    newpost.sample_url = './assets/images/UI/flash.png'
                }
                if (post.file_ext == 'webm')
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
        var URL = `http://e621.net/post/show.json?username=${this.username}&password=${this.password}&id=${id}`

        $.get(URL, (response) =>
        {
            //var ghost = document.implementation.createHTMLDocument('virtual')
            // Ghost isn't needed for E621, since E621's API is freely available

            var post = response
            var newpost = new defs.post(post.id)

            newpost.file_url = post.file_url
            newpost.file_height = post.file_height
            newpost.file_width = post.file_width
            newpost.tags = post.tags.split(' ')
            newpost.page_url = `http://e621.net/post/show.json?id=${id}`

            if (post.file_ext == 'webm')
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

module.exports = new e621