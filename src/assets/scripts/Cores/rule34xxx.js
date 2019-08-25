var $ = require('jquery')
var defs = require('../definitions')
var common = require('../common')

class rule34xxx
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

        var URL = `https://rule34.xxx/index.php?page=dapi&s=post&q=index&limit=50&pid=${page}`

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
            
            //var parser = new DOMParser()
            //var xmlDoc = parser.parseFromString(response.replace(/async/g, ''), 'text/xml')
            
            
            var posts = {}

            $('posts', response).children().each((index, post) =>
            {
                
                var $post = $(post)
                var newpost = new defs.thumb($(post).attr('id'))
                
                newpost.sample_url = $post.attr('preview_url')
                newpost.sample_height = $post.attr('preview_height')
                newpost.sample_width = $post.attr('preview_width')
                //newpost.file_ext = $post.attr('file_ext')
                newpost.tags = $post.attr('tags')

                if (newpost.tags.includes('swf'))
                {
                    newpost.sample_url = './assets/images/UI/flash.png'
                }
                if (newpost.tags.includes('webm'))
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
            console.log($('posts', response))
            callback(posts)
        })
    }

    fetch_post(id, callback = (post) => {})
    {
        var URL = `https://rule34.xxx/index.php?page=dapi&s=post&q=index&id=${id}`

        $.get(URL, (response) =>
        {
            //var ghost = document.implementation.createHTMLDocument('virtual')
            // Ghost isn't needed for E621, since E621's API is freely available

            
            var $post = $('post', response)
            var newpost = new defs.post($post.attr('id'))

            newpost.file_url = $post.attr('file_url')
            newpost.file_height = $post.attr('height')
            newpost.file_width = $post.attr('width')
            newpost.tags = $post.attr('tags').split(' ')
            newpost.page_url = `https://rule34.xxx/index.php?page=post&s=view&id=${id}`

            if ($post.attr('tags').includes('webm'))
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

module.exports = new rule34xxx