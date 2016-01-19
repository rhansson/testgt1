# 
library(opencpu)
# opencpu$browse("/library/testgt1/www/testgt1.html")
#
#
# installing/loading the package:
#if(!require(installr)) {
#  install.packages("installr"); require(installr)} #load / install+load installr
#updateR() # brings up dialogs and suggests using rGUI for the update


test <-function (x="") {
  print("test")
  list(message = paste(x, " ", R.Version()$version.string))
}


testgt1 <- function (sw, ne, zoom=14, theme="starb", style="val", theme2="") {  
  # testgt1( c(33.73428,-117.97638), c(33.82038,-117.82981), 15)
  #res = list(sw, ne)  # list of two LatLng objects * NOTICE order lat[1] lon[2]
  df <- list()

  xmin <- sw[2]
  ymin <- sw[1]
  xmax <- ne[2]
  ymax <- ne[1]  
  df <- getPoints(theme, xmin, ymin, xmax, ymax)  
  
  return(df)
}

getPoints <-function(theme, xmin, ymin, xmax, ymax) {
  # set working dir to path of R script for csv file input
  # http://stackoverflow.com/questions/3452086/getting-path-of-an-r-script?lq=1
  try({  # Ignore opencpu ERROR: character argument expected In call: setwd(rdir)
    rdir <- getSrcDirectory(function(x) {x})
    setwd(rdir)
  })
  df2 <- data.frame(matrix(ncol = 0, nrow = 0))
  if (theme=="starb") {
    df = read.csv("starbucks_oc.csv", sep="\t")
    #View(df)
    df2 <- subset(df, X>xmin & Y>ymin & X<xmax & Y<ymax, select = c(X,Y))
    colnames(df2)[which(names(df2) == "X")] <- "x"
    colnames(df2)[which(names(df2) == "Y")] <- "y"
  } else if (theme=="colls") {
    df = read.csv("collision.csv", sep=",")
    #View(df)
    df2 <- subset(df, POINT_X>xmin & POINT_Y>ymin & POINT_X<xmax & POINT_Y<ymax, select = c(POINT_X,POINT_Y, INJURED))
    colnames(df2)[which(names(df2) == "POINT_X")] <- "x"
    colnames(df2)[which(names(df2) == "POINT_Y")] <- "y"
  } 
  return(df2)
}

corXY <-function(df) {
  Cor <- cor(df, use="complete.obs")
  #print(Cor)
  corVal <- Cor[2,1]
  return(corVal)
}
