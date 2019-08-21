var $ = require('jquery')
var defs = require('../definitions')
var common = require('../common')

class gelbooru
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
        var URL

        if (page == 1)
        {
            URL = `http://gelbooru.com/index.php?page=post&s=list`
        }
        else
        {
            URL = `http://gelbooru.com/index.php?page=post&s=list&pid=${(page-1) * 42}`
        }
        
        URL += common.parse_tags(this, tags)

        if (page > 50)
        {
            URL += `&next=${this.last_id}`
        }

        console.log(URL)
        $.get(URL, (response) =>
        {
            var ghost = document.implementation.createHTMLDocument('virtual')
            var posts = {}

            $(response, ghost).find('span.thumb').each((index, element) =>
            {
                var id = $(element).find('a').attr('id').slice(1, element.id.length)
                posts[id] = new defs.thumb(id)

                posts[id].sample_url = $(element).find('img').attr('src')
                posts[id].sample_height= 'auto'
                posts[id].sample_width = 'auto'
                posts[id].format = 'image'
                posts[id].tags = $(element).find('img').attr('title').split(' ')

                if (posts[id].tags.includes('video'))
                {
                    posts[id].format = 'video'
                }
                else
                {
                    posts[id].format = 'image'
                }

                this.last_id = id
            })

            //console.log(response)
            callback(posts)
        })
    }

    fetch_post(id, callback = (post) => {})
    {
        var URL = `http://gelbooru.com/index.php?page=post&s=view&id=${id}`

        $.get(URL, (response) =>
        {
            var ghost = document.implementation.createHTMLDocument('virtual')

            var image = $(response, ghost).find('#image')
            var newpost = new defs.post(id)

            if (image.length)
            {
                newpost.file_url = $(response, ghost).find('a:contains(Original image)').attr('href')
                newpost.file_height = image.css('height')
                newpost.file_width = image.css('width')
                newpost.tags = image.attr('alt').split(' ')  
                newpost.format = 'image'  
            }
            else
            {
                var video = $(response, ghost).find('#gelcomVideoPlayer').find('source').first()
                console.log(video)
                newpost.file_url = video.attr('src')
                newpost.file_height = ''
                newpost.file_width = ''
                newpost.tags = []//image.attr('alt').split(' ')  
                newpost.format = 'video'  
            }

            callback(newpost)
        })
    }
}

module.exports = new gelbooru