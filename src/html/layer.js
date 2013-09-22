/** 
 * HTML module.
 * @module dicom
 */
var dwv = dwv || {};
dwv.html = dwv.html || {};

/**
 * Window layer.
 * @class Layer
 * @namespace dwv.html
 * @constructor
 * @param {String} name The name of the layer.
 */
dwv.html.Layer = function(name)
{
    // A HTMLCanvasElement.
    var canvas = null;
    // A CanvasRenderingContext2D.
    var context = null;
    
    // Get the layer name.
    this.getName = function() { return name; };
    // Get the layer canvas.
    this.getCanvas = function() { return canvas; };
    // Get the layer context
    this.getContext = function() { return context; };
    // Get the layer offset on page
    this.getOffset = function() { return $('#'+name).offset(); };

    // Image data array
    var imageData = null;
    
    // Image information
    var originX = 0;
    var originY = 0;
    var zoomX = 1;
    var zoomY = 1;
    
    // set the zoom
    this.setZoom = function(stepX,stepY,centerX,centerY)
    {
        var newZoomX = zoomX + stepX;
        var newZoomY = zoomY + stepY;
        // check zoom value
        if( newZoomX <= 0.1 || newZoomX >= 10 ||
            newZoomY <= 0.1 || newZoomY >= 10 ) return;
        // The zoom is the ratio between the differences from the center
        // to the origins:
        // centerX - originX = ( centerX - originX0 ) * zoomX
        originX = centerX - (centerX - originX) * (newZoomX / zoomX);
        originY = centerY - (centerY - originY) * (newZoomY / zoomY);
        // save zoom
        zoomX = newZoomX;
        zoomY = newZoomY;
        // draw 
        this.draw();
    };
    
    // zoom the layer
    this.zoom = function(zx,zy,cx,cy)
    {
        // set zoom
        this.setZoom(zx, zy, cx, cy);
        // draw 
        this.draw();
    };

    // translation is according to the last one
    this.setTranslate = function(tx,ty)
    {
        // check translate value
        if( zoomX >= 1 ) { 
            if( (originX + tx) < -1 * (canvas.width * zoomX) + canvas.width ||
                (originX + tx) > 0 ) return;
        } else {
            if( (originX + tx) > -1 * (canvas.width * zoomX) + canvas.width ||
                (originX + tx) < 0 ) return;
        }
        if( zoomY >= 1 ) { 
            if( (originY + ty) < -1 * (canvas.height * zoomY) + canvas.height ||
                (originY + ty) > 0 ) return;
        } else {
            if( (originY + ty) > -1 * (canvas.height * zoomY) + canvas.height ||
                (originY + ty) < 0 ) return;
        }
        // new origin
        originX += tx;
        originY += ty;
    };
    
    // translation is according to the last one
    this.translate = function(tx,ty)
    {
        // set the translate
        this.setTranslate(tx, ty);
        // draw
        this.draw();
    };
    
    // set the image data array
    this.setImageData = function(data)
    {
        imageData = data;
    };
    
    /**
     * Reset the layout
     */ 
    this.resetLayout = function()
    {
        originX = 0;
        originY = 0;
        zoomX = 1;
        zoomY = 1;
    };
    
    /**
     * Draw the content (imageData) of the layer.
     * The imageData variable needs to be set
     */
    this.draw = function()
    {
        // clear the context
        this.clearContextRect();
        
        // Put the image data in the context
        
        // 1. store the image data in a temporary canvas
        var tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        tempCanvas.getContext("2d").putImageData(imageData, 0, 0);
        // 2. draw the temporary canvas on the context
        context.drawImage(tempCanvas,
            originX, originY,
            canvas.width * zoomX, 
            canvas.height * zoomY);
    };
    
    /**
     * Initialise the layer: set the canvas and context
     * @input width The width of the canvas.
     * @input height The height of the canvas.
     */
    this.initialise = function(inputWidth, inputHeight)
    {
        // find the canvas element
        canvas = document.getElementById(name);
        if (!canvas)
        {
            alert("Error: cannot find the canvas element for '" + name + "'.");
            return;
        }
        // check that the getContext method exists
        if (!canvas.getContext)
        {
            alert("Error: no canvas.getContext method for '" + name + "'.");
            return;
        }
        // get the 2D context
        context = canvas.getContext('2d');
        if (!context)
        {
            alert("Error: failed to get the 2D context for '" + name + "'.");
            return;
        }
        // canvas sizes
        canvas.width = inputWidth;
        canvas.height = inputHeight;
        // original empty image data array
        context.clearRect (0, 0, canvas.width, canvas.height);
        imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    };
    
    /**
     * Fill the full context with the current style.
     */
    this.fillContext = function()
    {
        context.fillRect( 0, 0, canvas.width, canvas.height );
    };
    
    /**
     * Clear the full context.
     */
    this.clearContextRect = function()
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
    };
    
    /**
     * Merge two layers.
     * @input layerToMerge The layer to merge. It will also be emptied.
     */
    this.merge = function(layerToMerge)
    {
        // copy content
        context.drawImage(layerToMerge.getCanvas(), 0, 0);
        // reset layout
        this.resetLayout();
        // store the image data
        imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        // empty merged layer
        layerToMerge.clearContextRect();
    };
    
    /**
     * Set the fill and stroke style of the context.
     */
    this.setLineColor = function(color)
    {
        context.fillStyle = color;
        context.strokeStyle = color;
    };
    
    /**
     * Display the layer.
     */
    this.setStyleDisplay = function(val)
    {
        if( val === true )
        {
            canvas.style.display = '';
        }
        else
        {
            canvas.style.display = "none";
        }
    };
    
    this.isVisible = function()
    {
      if( canvas.style.display === "none" ) return false;
      else return true;
    };
    
    /**
     * Align on another layer.
     */
    this.align = function(rhs)
    {
        canvas.style.top = rhs.getCanvas().offsetTop;
        canvas.style.left = rhs.getCanvas().offsetLeft;
    };
}; // Layer class
