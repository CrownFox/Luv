function parse_tags(self, tags)
{
    if (tags != null)
    {
        //Include the supplied tags and store them
        self.tags = tags
        return `&tags=${tags.split(' ').join('+')}`
    }
    else
    {
        //Check for stored tags since the user didn't supply any
        if (self.tags != null)
        {
            if (self.page > 1) //Make sure we're not starting from page 1
            {
                return `&tags=${self.tags.split(' ').join('+')}`
            }
            else //If we're on page one, empty the tags, since the user is browsing all posts by new
            {
                self.tags = null
            }
        }
    }

    return ''
}

module.exports = {
    parse_tags: parse_tags
}