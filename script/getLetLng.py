import csv
import requests


def getdifferentplacesFromFile():
    placeslist = []
    counter = 0
    with open('Police Deaths.csv', 'rb') as csvfile:
        reader = csv.reader(csvfile, delimiter=';', quotechar='"')
        headline = reader.next()
        #gets index for the state/place
        matchedindex=None
        foundindex=None
        for entry in headline:
            #print entry
            if entry=="state":
                stateindex=counter
            if entry=="dept_name":
                placeindex=counter
            if entry=="notFound":
                foundindex=counter
            if entry == "notMatched":
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

def transformPlacename(place):
    print place
    removewords = ["'s","Sheriff", "Office", "Police", "Department", "Office", "Watch", "Constable", "Night", "Marshal","Task Force"]
    for word in removewords:
        #print word
        place= place.replace(word, "")
    print place +"  after"
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
    # check status: OK OVER_QUERY_LIMIT ZERO_RESULTS
    #status = response["status"]
    #if status == "OK":
    matched = False
    for result in response["results"]:
        if not matched:
            # short statename from jsonresponse in order to verify geodata
            stategeo = "teststate"
            for entry in result["address_components"]:
                if len(entry["types"]) > 0 and entry["types"][0] == "administrative_area_level_1":
                    stategeo = entry["short_name"]
                    #print(state+"="+stategeo)
            # if state for csv equals state from geodata --> geodata is verified
            print(state + "=" + stategeo)
            if state == stategeo:
                latlng = result["geometry"]["location"]
                lat = latlng["lat"]
                lng = latlng["lng"]
                latlngInfo = place
                latlngInfo["lat"] = lat
                latlngInfo["lng"] = lng
                #funktioniert
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

   # elif status == "OVER_QUERY_LIMIT":
    #    print "Query limt no response"
    #    return

    #elif status == "ZERO_RESULTS":
    #    place["notFound"] = True
    #    print "no Results"
    #    return place

def saveSuccessData():
    #wenn daten vorhanden dann einlesen
    import os.path
    counter = 0
    # successList=[]
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
    #daten schreiben
    with open('latlngFordept_name.csv', 'wb') as csvfile:
        writer = csv.writer(csvfile, delimiter=',', quotechar='"')
        writer.writerow(['dept_name'] + ['state'] + ['lat'] + ['lng'])
        for entry in successList:
            # print entry
            writer.writerow([entry["place"], entry["state"], entry["lat"], entry["lng"]])

def saveLeftData():
    with open('Police Deaths.csv', 'wb') as csvfile:
        writer = csv.writer(csvfile, delimiter=';', quotechar='"')
        writer.writerow(['dept_name'] + ['state'] + ['notFound'] + ['notMatched'])
        for entry in placeslist:
            writer.writerow([entry["place"], entry["state"], entry["notFound"], entry["notMatched"]])

#Main logic
#gets different places from file
placeslist= getdifferentplacesFromFile()
print placeslist
successList=[]
test=0
for place in placeslist:
    # normalen request ausfuhren
    #if test>10:
    #    break
    print "start: "+str(test)
    print place
    if place["notFound"]=="False" and place["notMatched"]=="False":
        print "test normal"
        response=sendRequest(place["place"])
    else:
        # anfrage von anfang an mit state!
        response=sendRequest(transformPlacename(place["place"]+" "+place["state"]))
    #response status pruefen!
    status = response["status"]
    if status == "OK":
        data=parseResponse(response,place)
    elif status == "OVER_QUERY_LIMIT":
        print "Query limt no response"
        break

    elif status == "ZERO_RESULTS":
        place["notFound"] = True
        print "no Results"

    #print data
    #print test
    test+=1

    if(data==None):
        print "no result"
    elif("lat" in data.keys() and "lng" in data.keys()):
        print data
        print len(placeslist)
        print "found"

# successList und placeslist speichern
saveSuccessData()
saveLeftData()

#anfrage wird immer bearbeitet!