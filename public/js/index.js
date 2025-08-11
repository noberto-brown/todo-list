const getYear = () => {
  const today = new Date();

  const options = {
    year: "numeric",
  };

  const year = today.toLocaleDateString("en-US", options);
  return year;
};

document.getElementById("year").innerHTML = getYear();
