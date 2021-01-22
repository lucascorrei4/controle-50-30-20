import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject, Observable, BehaviorSubject } from "rxjs";
import {
  distinctUntilChanged,
  map,
  share,
  shareReplay,
  take,
  tap,
} from "rxjs/operators";
import { Category } from "../models/category";
import { Earning } from "../models/earning";
import { Launch } from "../models/launch";
import { RepeatedLaunch } from "../models/repeated-launch";
import { User } from "../models/user";
import { ConfigService } from "../services/config.service";
import { StorageService } from "../services/storage.service";

@Injectable({
  providedIn: "root",
})
export class Controle503020Service {
  private url: string = "";
  private token: any;
  private atualizarCarrinhoSubject = new Subject<any>();
  public categoriesGrouped: any[] = [];
  public selectedMonth: BehaviorSubject<string> = new BehaviorSubject(null);
  public monthEarning: BehaviorSubject<number> = new BehaviorSubject(0);

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private storageService: StorageService
  ) {
    this.url = configService.getUrlServiceNode();

    this.token = new HttpHeaders({
      Authorization:
        localStorage?.getItem("localToken") ??
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MDkyNzA5Njl9.V0CyDBc8DSozN0pbe6rNIY0l8fjFAyifxqm10wd-Fow",
    });
  }

  get selectedMonth$(): Observable<string> {
    return this.selectedMonth
      .asObservable()
      .pipe(distinctUntilChanged(), shareReplay());
  }

  get monthEarning$(): Observable<number> {
    return this.monthEarning
      .asObservable()
      .pipe(distinctUntilChanged(), shareReplay());
  }

  // User

  newUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.url}/user`, user, {
      headers: this.token,
    });
  }

  findUserByEmail(email: string): Observable<User> {
    return this.http
      .get<User>(`${this.url}/user/findByEmail?email=${email}`, {
        headers: this.token,
      })
      .pipe(
        tap((user) => {
          this.storageService.setLocalUser(user);
        })
      );
  }

  // Categories

  getCategories(): Observable<Category[]> {
    return this.http
      .get<Category[]>(`${this.url}/category`, {
        headers: this.token,
      })
      .pipe(
        tap((category) => {
          this.groupCategories(category);
        })
      );
  }

  public groupCategories(categories) {
    var groups = new Set(categories.map((item) => item.type));
    groups.forEach((g) =>
      this.categoriesGrouped.push({
        name: g,
        subItems: categories.filter((i) => i.type === g),
      })
    );
    this.storageService.setLocalStorageCategories(this.categoriesGrouped);
  }

  // Launchs

  newLaunch(launch: Launch): Observable<Launch> {
    return this.http.post<Launch>(`${this.url}/launch`, launch, {
      headers: this.token,
    });
  }

  removeLaunch(id) {
    let httpParams = new HttpParams().set("_id", id);

    let options = { params: httpParams };

    return this.http
      .delete(`${this.url}/launch`, options)
      .pipe(take(1), share());
  }

  findLaunchesByUserIdAndMonthAndType(
    userId: string,
    month?: string,
    type?: string
  ): Observable<Launch[]> {
    if (type) {
      return this.http.get<Launch[]>(
        `${this.url}/launch/findByUserIdAndMonthAndType?userId=${userId}&month=${month}&type=${type}`,
        {
          headers: this.token,
        }
      );
    }
    return this.http.get<Launch[]>(
      `${this.url}/launch/findByUserIdAndMonthAndType?userId=${userId}&month=${month}`,
      {
        headers: this.token,
      }
    );
  }

  // Repeated Launchs

  newRepeatedLaunch(launch: RepeatedLaunch): Observable<RepeatedLaunch> {
    return this.http.post<RepeatedLaunch>(
      `${this.url}/repeated-launch`,
      launch,
      {
        headers: this.token,
      }
    );
  }

  findRepeatedLaunchesByUserIdAndType(
    userId: string,
    type?: string
  ): Observable<Launch[]> {
    if (type) {
      return this.http.get<Launch[]>(
        `${this.url}/launch/findByUserIdAndType?userId=${userId}&type=${type}`,
        {
          headers: this.token,
        }
      );
    }
    return this.http.get<Launch[]>(
      `${this.url}/launch/findByUserIdAndType?userId=${userId}`,
      {
        headers: this.token,
      }
    );
  }

  findByUserIdCategoryAndValue(
    userId: string,
    categoryId?: number,
    valor?: number
  ): Observable<Launch[]> {
    return this.http.get<Launch[]>(
      `${this.url}/launch/findByCategoryAndValue?userId=${userId}&categoryId=${categoryId}&valor=${valor}`,
      {
        headers: this.token,
      }
    );
  }

  // Earning

  newEarning(earning: Earning): Observable<Earning> {
    return this.http.post<Earning>(`${this.url}/earning`, earning, {
      headers: this.token,
    });
  }

  findEarningByUserIdAndRef(userId: string, ref?: string): Observable<Earning> {
    return this.http.get<Earning>(
      `${this.url}/earning/findEarningByUserIdAndRef?userId=${userId}&ref=${ref}`
    );
  }

  atualizarCarrinhoObservable(): Observable<any> {
    return this.atualizarCarrinhoSubject.asObservable();
  }

  atualizarCarrinho() {
    this.atualizarCarrinhoSubject.next();
  }
}
