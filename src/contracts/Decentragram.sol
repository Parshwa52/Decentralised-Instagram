pragma solidity ^0.5.0;

contract Decentragram {
  string public name="Decentragram";

  //Store Images
  mapping (uint=> Image) public images;

  uint public imagecount=0;
  struct Image
  {
    uint id;
    string hash;
    string description;
    uint tipamount;
    address payable author;
  }

  event ImageCreated
  (
    uint id,
    string hash,
    string description,
    uint tipamount,
    address payable author
  );

  event ImageTipped
  (
    uint id,
    string hash,
    string description,
    uint tipamount,
    address payable author
  );

  //Create Image
  function uploadImage(string memory _imageHash,string memory _description) public{

    require(bytes(_description).length>0);//make sure image description exists
    require(bytes(_imageHash).length>0);//image hash exists
    require(msg.sender!=address(0x0));//uploader exists

      imagecount+=1;
      images[imagecount]=Image(imagecount,_imageHash,_description,0,msg.sender);
      emit ImageCreated(imagecount,_imageHash,_description,0,msg.sender);
  }

  //Tip image
  function tipImageOwner(uint _id) public payable {
    // Make sure the id is valid
    require(_id > 0 && _id <= imagecount);
    // Fetch the image
    Image memory _image = images[_id];
    // Fetch the author
    address payable _author = _image.author;
    // Pay the author by sending them Ether
    address(_author).transfer(msg.value);
    // Increment the tip amount
    _image.tipamount = _image.tipamount + msg.value;
    // Update the image
    images[_id] = _image;
    // Trigger an event
    emit ImageTipped(_id, _image.hash, _image.description, _image.tipamount, _author);
  }

}
