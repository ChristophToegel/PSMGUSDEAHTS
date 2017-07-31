import csv
import requests

def getdifferentplacesFromFile(path):
    placeslist = []
    counter = 0
    with open(path , 'rb') as csvfile:
        reader = csv.reader(csvfile, delimiter=',', quotechar='"')
        headline = reader.next()
        print headline
        #gets index for the state/place
        matchedindex=None
        foundindex=None
        for column in headline:
            #print column
            if column=="state":
                stateindex=counter
            if column=="dept_name":
                placeindex=counter
            if column=="notFound":
                foundindex=counter
            if column == "notMatched":
                matchedindex = counter
            counter+=1
        #print stateindex
        #print placeindex
        #print counter
        if matchedindex == None:
            original=True
            print "original"
            for row in reader:
                state=row[stateindex].replace(" ","")
                place = {"place": row[placeindex], "state": state,"notFound":False, "notMatched":False}
                #print state
                if place not in placeslist:
                    placeslist.append(place)
        else:
            original=False
            print "not original"
            for row in reader:
                state=row[stateindex].replace(" ","")
                place = {"place": row[placeindex], "state": state,"notFound":row[foundindex], "notMatched":row[matchedindex]}
                #print state
                if place not in placeslist:
                    placeslist.append(place)
        #print placeslist
    print str(len(placeslist)) +" different places"
    return placeslist

#modify dept_name
def transformPlacename(place):
    print place
    removewords = ["'s","Sheriff", "Office", "Police", "Department", "Office", "Watch", "Constable", "Night", "Marshal","Task Force"]
    for word in removewords:
        place= place.replace(word, "")
    return place

def sendRequest(place):
    place = place.replace(" ", "%20")
    url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + place + "&key=AIzaSyDXHNkj2tKiXXweY2fAB0e3lT9EWojzyY4"
    print(url)
    r = requests.get(url)
    response = r.json()
    return response

def parseResponse(response,place):
    state = place["state"]
    matched = False
    for result in response["results"]:
        if not matched:
            # short statename from jsonresponse in order to verify geodata
            stategeo = ""
            for entry in result["address_components"]:
                if len(entry["types"]) > 0 and entry["types"][0] == "administrative_area_level_1":
                    stategeo = entry["short_name"]
            # if state for csv equals state from geodata --> geodata is verified
            print(state + "=" + stategeo)
            if state == stategeo:
                latlng = result["geometry"]["location"]
                lat = latlng["lat"]
                lng = latlng["lng"]
                latlngInfo = place
                latlngInfo["lat"] = lat
                latlngInfo["lng"] = lng
                successList.append(latlngInfo)
                placeslist.remove(place)
                matched = True
                place["notMatched"] = False
                place["notFound"] = False
                return place
                print ("found: " + place + "  " + str(latlng))

    if not matched:
        print "States do not match:" + str(place)
        place["notMatched"] = True
        return place

def saveSuccessData():
    #if file already exists read data
    import os.path
    counter = 0
    if os.path.isfile('latlngFordept_name.csv'):
        with open('latlngFordept_name.csv', 'rb') as csvfile:
            reader = csv.reader(csvfile, delimiter=',', quotechar='"')
            headline = reader.next()
            for entry in headline:
                print entry
                if entry == "state":
                    stateindex = counter
                if entry == "dept_name":
                    placeindex = counter
                if entry == "lat":
                    latindex = counter
                if entry == "lng":
                    lngindex = counter
                counter += 1
            for entry in reader:
                dict = {"place": entry[placeindex], "state": entry[stateindex], "lat": entry[latindex],
                        "lng": entry[lngindex]}
                successList.append(dict)
    #write data
    with open('latlngFordept_name.csv', 'wb') as csvfile:
        writer = csv.writer(csvfile, delimiter=',', quotechar='"')
        writer.writerow(['dept_name'] + ['state'] + ['lat'] + ['lng'])
        for entry in successList:
            writer.writerow([entry["place"], entry["state"], entry["lat"], entry["lng"]])

#save left Data
def saveLeftData(path):
    with open(path, 'wb') as csvfile:
        writer = csv.writer(csvfile, delimiter=';', quotechar='"')
        writer.writerow(['dept_name'] + ['state'] + ['notFound'] + ['notMatched'])
        for entry in placeslist:
            writer.writerow([entry["place"], entry["state"], entry["notFound"], entry["notMatched"]])


#Main logic
#gets different places from file
path="clean_data.csv"
placeslist= getdifferentplacesFromFile(path)
print placeslist

successList=[]
iteration=0
for place in placeslist:
    # request for every place
    print "start: "+str(iteration)
    print place
    if place["notFound"]=="False" and place["notMatched"]=="False":
        print "normal request"
        response=sendRequest(place["place"])
    else:
        print "dept_name modified request"
        response=sendRequest(transformPlacename(place["place"]+" "+place["state"]))
    #check response status
    status = response["status"]
    if status == "OK":
        data=parseResponse(response,place)
    elif status == "OVER_QUERY_LIMIT":
        print "Query limt no response"
        break

    elif status == "ZERO_RESULTS":
        place["notFound"] = True
        print "no Results"

    if(data==None):
        print "no result"
    elif("lat" in data.keys() and "lng" in data.keys()):
        print data
        print len(placeslist)
        print "found"
    iteration+=1

# save successList und placeslist
saveSuccessData()
saveLeftData(path)