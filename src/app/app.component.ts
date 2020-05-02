import { Component, ElementRef, OnInit } from '@angular/core';
import { AGENTS, BING_KEY, COLUMN_HEADERS } from './consts';
import { IAgent, ICountryAgent } from './app.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  agents = AGENTS;
  bingKey = BING_KEY;
  headers = COLUMN_HEADERS;
  results: ICountryAgent;
  londonPoint = {lat: 0, long: 0};
  maxDistance = 0;
  minDistance = 100000000; // set huge km distance to be the first max
  minAddress = '';
  maxAddress = '';
  bingBaseUrl = 'http://dev.virtualearth.net/REST/v1/Locations?query=';
  londonAddress = '10 Downing st. London';

  constructor(private http: HttpClient, private elRef: ElementRef) {}

  ngOnInit(): void {
    // Part 1 of the task (see reponse in http://localhost:4200/)
    this.results = this.getIsolatedCountry(this.agents);
    // Part 2 - sort agents by date
    this.agents.sort((current: IAgent, next: IAgent) => {
      return Date.parse(current.date) - Date.parse(next.date);
    });
    // Part 3 Bonus - use bing maps to get distances and mark colors
    this.setLondonPoint();
    this.getDistancesAndCalculate();
  }

  // *** Part 1 - An isolated agent ***
  getIsolatedCountry(agentsList: IAgent[]): ICountryAgent {
    if (agentsList.length === 0) {throw Error('empty agents array!'); }

    const countriesList: Array<ICountryAgent> = [];
    const uniqueTotalAgentsSet = new Set<string>();
    agentsList.forEach((agent: IAgent) => {
      // if agent exists
      if (uniqueTotalAgentsSet.has(agent.agent)) {
        countriesList.forEach((country: ICountryAgent) => {
          if (country.agentsSet.has(agent.agent)) {
            country.isolatedAgentsSet.delete(agent.agent);
          }
        });
        this.createOrUpdateCountryMap(countriesList, agent, false);
      }
      else {
        // new isolated agent - add to set
        uniqueTotalAgentsSet.add(agent.agent);
        this.createOrUpdateCountryMap(countriesList, agent, true);
      }
    });

    return countriesList.reduce((prev: ICountryAgent, current: ICountryAgent) =>
      (prev.isolatedAgentsSet.size > current.isolatedAgentsSet.size) ? prev : current);
  }

  private createOrUpdateCountryMap(countriesList: Array<ICountryAgent>, agent: IAgent, isIsolated: boolean): void {
    const currentCountryIndex = countriesList.findIndex((country: ICountryAgent) => country.name === agent.country);
    if (currentCountryIndex > -1) {
      // country in map already - add to set plus isolation
      countriesList[currentCountryIndex].agentsSet.add(agent.agent);
      if (isIsolated) {
        countriesList[currentCountryIndex].isolatedAgentsSet.add(agent.agent);
      }
    } else {
      // insert country to map for the first time according to isolation level
      const agentsSet = new Set<string>();
      const isolatedAgentsSet = new Set<string>();
      agentsSet.add(agent.agent);
      countriesList.push( {
        name: agent.country,
        agentsSet,
        isolatedAgentsSet: isIsolated ? isolatedAgentsSet.add(agent.agent) : isolatedAgentsSet
      });
    }
  }

  // *** Part 3 Bonus - using bing maps ***

  private getDistancesAndCalculate() {
    this.requestJsonpFromMultipleSources(this.agents).subscribe((list: Array<any>) => {
      list.forEach((data: any) => {
        const lat = data.res.resourceSets[0].resources[0].point.coordinates[0];
        const long = data.res.resourceSets[0].resources[0].point.coordinates[1];
        this.calculateDistance(lat, long, data.agent);
      });
      for (const element of this.elRef.nativeElement.querySelectorAll('.agentRow')) {
        if (element.textContent.includes(this.minAddress)) {
          element.style.color = 'green';
        }
        if (element.textContent.includes(this.maxAddress)) {
          element.style.color = 'red';
        }
      }
    });
  }

  private setLondonPoint() {
    const londonUrl = this.bingBaseUrl + encodeURIComponent(this.londonAddress) + `&jsonp=JSONP_CALLBACK&key=${this.bingKey}`;
    this.http.jsonp(londonUrl, 'JSONP_CALLBACK').pipe(
      catchError((data) => of(console.log('jsonpTest Error'))),
    ).subscribe((data: any) => {
      this.londonPoint.lat = +data.resourceSets[0].resources[0].point.coordinates[0];
      this.londonPoint.long = +data.resourceSets[0].resources[0].point.coordinates[1];
    });
  }

  public requestJsonpFromMultipleSources(agents): Observable<any[]> {
    const responses = [];
    agents.forEach(agent => {
      const geocodeRequest = this.bingBaseUrl + encodeURIComponent(agent.address) + `&jsonp=JSONP_CALLBACK&key=${this.bingKey}`;
      responses.push(this.http.jsonp(geocodeRequest, 'JSONP_CALLBACK').pipe(map(res => ({
        res, agent}))
      ));
    });
    return forkJoin(responses);
  }

  calculateDistance(latitude, longitude, agent: IAgent): void {
    // using simple calculation to get KM distance from London Spot
    const R = 6371; // km constant
    const dLat = (this.londonPoint.lat - latitude) * Math.PI / 180;
    const dLon = (this.londonPoint.long - longitude) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(latitude * Math.PI / 180 ) * Math.cos(this.londonPoint.lat * Math.PI / 180 ) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    if (distance > 0 && distance > this.maxDistance) {
      this.maxDistance = distance;
      this.maxAddress = agent.address;
    }
    if (distance > 0 && distance < this.minDistance) {
      this.minDistance = distance;
      this.minAddress = agent.address;
    }
  }
}
