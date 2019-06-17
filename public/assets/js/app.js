$(document).on("click", "#note", function() {
  //When a note link is clicked on the a card:
  //1. Get the article ID and save it to access the article and all associated notes
  var thisId = $(this).attr("data-id");
  console.log(thisId);
  console.log("Calling get api");
  // Now make an ajax call for the Article to get all associated Notes
  $.ajax({
    method: "get",
    url: "/articles/" + thisId
  })
   //When control returns
    .then(function(data) {
      //if there are notes, loop and display them in the modal card
      $("#exampleModalScrollable .card-body").empty();
      $("#exampleModalScrollable .card-body").append("<p> No notes add to this article </p");
      if (data.note) {
          console.log(data.note)
          $("#exampleModalScrollable .card-body").empty();
          $("#exampleModalScrollable .card-body").append("<p>" + data.note.title + "</p");
      }
      $('#exampleModalScrollable').modal('show');
    });
});

// When you click the savenote button
$(document).on("click", ".saveNote", function(event) {
  event.preventDefault();
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      body: $("#exampleFormControlTextarea1").val(),
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $(".card-body").empty();
      $(".card-body").append("<p>" + data.note.title + "</p");
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("##exampleFormControlTextarea1").val("");
});

$(document).on("click", "#deleteArticle", function() {
  var article_id = $(this).attr("data-id");
  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "delete",
    url: "/articles/" + article_id,
  }).then(function(data) {
      //remove the card for deleted article form the array
      $("[data-id=" + article_id + "]").remove();
    }
  );
});

// When you click the savenote button
$(document).on("click", "#saveArticle", function() {
  // Grab the id associated with the article from the submit button
  var link = $(this).attr("data-link");
  var title = $(this).attr("data-title");
  var id = ($(this).attr("data-id"));

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/save",
    data: {
      // Value taken from title input
      title: title,
      // Value taken from note textarea
      link: link
    }
  }).then(function(data) {
      // Remove the card that for saved article from the scraped card list
      $("[data-id=" + id + "]").remove();
    }
  );
});
